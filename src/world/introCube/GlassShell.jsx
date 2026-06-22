import { useMemo } from 'react'
import { BoxGeometry, MeshPhysicalMaterial, DoubleSide, MeshDepthMaterial, RGBADepthPacking } from 'three'
import { useExperience } from '../../stores/useExperience'
import { CUBE_HALF } from './cubeEdges'

export default function GlassShell() {
  const currentPhase = useExperience((state) => state.currentPhase)
  const isLowEnd = useExperience((state) => state.isLowEnd)

  const { geometry, material, depthMaterial } = useMemo(() => {
    const geo = new BoxGeometry(CUBE_HALF * 2.0, CUBE_HALF * 2.0, CUBE_HALF * 2.0)

    // THE TRUE PHYSICAL MATERIAL RESTORED FOR ALL DEVICES
    const mat = new MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1.0,     // TRUE REFRACTION RESTORED
      opacity: 1.0,          
      metalness: 0.1,        
      roughness: 0.0,        
      ior: 1.5,              
      thickness: 1.5,        
      clearcoat: 1.0,        
      clearcoatRoughness: 0.05,
      side: DoubleSide,      
      transparent: true,     
      depthWrite: true       
    })

    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = `
         varying vec3 vLocalNormal;
         varying vec2 vMyUv;
         ${shader.vertexShader}
      `.replace('#include <begin_vertex>', `#include <begin_vertex>\nvLocalNormal = normal; \nvMyUv = uv;`)

      shader.fragmentShader = `
         varying vec3 vLocalNormal;
         varying vec2 vMyUv;

         vec2 hash2(vec2 p) {
             p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
             return fract(sin(p) * 43758.5453);
         }

         struct Vitrail { vec3 color; float lead; vec3 normalTilt; };

         Vitrail getOrosi(vec3 localNormal, vec2 currentUv) {
            vec3 absNorm = abs(localNormal);
            float faceSeed = 0.0;
            if (absNorm.x > 0.5) faceSeed = localNormal.x > 0.0 ? 1.1 : 1.2;
            else if (absNorm.y > 0.5) faceSeed = localNormal.y > 0.0 ? 3.3 : 1.4;
            else faceSeed = localNormal.z > 0.0 ? 1.5 : 8.6;

            vec2 centeredUv = currentUv - 0.5;
            float angle = atan(centeredUv.y, centeredUv.x) + faceSeed * 1.5;
            float radius = length(centeredUv) - 0.1;

            float segment = 3.14159265 * 2.0 / 8.0;
            angle = mod(angle, segment);
            angle = abs(angle - segment / 2.0);
            vec2 symUv = vec2(cos(angle), sin(angle)) * radius;

            vec2 gridUv = symUv * 10.0; 
            vec2 p = floor(gridUv);
            vec2 f = fract(gridUv);

            float minDist = 100.0;
            vec2 closestCell = vec2(0.0);
            vec2 closestCenter = vec2(0.0);

            for(int j=-1; j<=1; j++)
            for(int i=-1; i<=1; i++){
                vec2 b = vec2(float(i), float(j));
                vec2 h = hash2(p + b + faceSeed * 13.37);
                vec2 center = b + h;
                vec2 r = center - f;
                float d = dot(r, r);
                if(d < minDist){
                    minDist = d;
                    closestCell = p + b;
                    closestCenter = center;
                }
            }

            float edgeDist = 100.0;
            
            // DYNAMIC ARCHITECTURE: 9-loop for Mobile, 25-loop for Desktop
            ${isLowEnd ? `
              for(int j=-1; j<=1; j++)
              for(int i=-1; i<=1; i++){
            ` : `
              for(int j=-2; j<=2; j++)
              for(int i=-2; i<=2; i++){
            `}
                vec2 b = vec2(float(i), float(j));
                vec2 h = hash2(p + b + faceSeed * 13.37);
                vec2 center = b + h;
                if(dot(center - closestCenter, center - closestCenter) > 0.00001) {
                    float d = dot(0.5 * (closestCenter + center) - f, normalize(center - closestCenter));
                    edgeDist = min(edgeDist, d);
                }
            }

            float shardSeed = fract(sin(dot(closestCell, vec2(12.9898, 78.233))) * 43758.5453);
            vec3 gColor;
            
            if (shardSeed < 0.50) gColor = vec3(0.9, 0.02, 0.05);      
            else if (shardSeed < 0.70) gColor = vec3(0.4, 0.0, 0.02);  
            else if (shardSeed < 0.85) gColor = vec3(1.0, 0.1, 0.2);   
            else if (shardSeed < 0.95) gColor = vec3(1.0, 0.6, 0.0);   
            else gColor = vec3(0.0, 0.2, 0.8);                         
            
            gColor *= 1.2; 

            vec2 dirToCenter = f - closestCenter;
            float bevelSlope = smoothstep(0.2, 0.0, edgeDist); 
            float isCenter = mix(1.0, 2.5, step(radius, 0.15)); 
            
            vec3 calculatedTilt = vec3(dirToCenter * bevelSlope * 1.5 * isCenter, 0.0);

            float customLead = smoothstep(0.03, 0.0, edgeDist);
            float bX = min(currentUv.x, 1.0 - currentUv.x);
            float bY = min(currentUv.y, 1.0 - currentUv.y);
            float hardEdge = smoothstep(0.02, 0.0, min(bX, bY));
            customLead = max(customLead, hardEdge);

            Vitrail v;
            v.color = gColor;
            v.lead = customLead;
            v.normalTilt = calculatedTilt;
            return v;
         }
         ${shader.fragmentShader}
      `.replace('void main() {', `void main() {\n Vitrail orosi = getOrosi(vLocalNormal, vMyUv);`)

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>\n if (orosi.lead < 0.5) normal = normalize(normal + orosi.normalTilt);`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb = mix(orosi.color, vec3(0.01), orosi.lead);`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n roughnessFactor = mix(0.0, 0.9, orosi.lead);`)
        .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>\n metalnessFactor = mix(0.1, 1.0, orosi.lead);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n if (!gl_FrontFacing) { vec3 coreLight = vec3(0.8, 0.7, 0.6); totalEmissiveRadiance += coreLight * orosi.color * (1.0 - orosi.lead); }`)
    }

    const depthMat = new MeshDepthMaterial({ depthPacking: RGBADepthPacking, side: DoubleSide })
    depthMat.onBeforeCompile = (shader) => {
      shader.vertexShader = `varying vec3 vLocalNormal; varying vec2 vMyUv;\n${shader.vertexShader}`.replace('#include <begin_vertex>', `#include <begin_vertex>\nvLocalNormal = normal;\nvMyUv = uv;`)
      shader.fragmentShader = `varying vec3 vLocalNormal; varying vec2 vMyUv;\nvec2 hash2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }\n${shader.fragmentShader}`.replace('void main() {', `void main() {
            vec3 absNorm = abs(vLocalNormal);
            float faceSeed = 0.0;
            if (absNorm.x > 0.5) faceSeed = vLocalNormal.x > 0.0 ? 1.1 : 1.2;
            else if (absNorm.y > 0.5) faceSeed = vLocalNormal.y > 0.0 ? 3.3 : 1.4;
            else faceSeed = vLocalNormal.z > 0.0 ? 1.5 : 8.6;

            vec2 centeredUv = vMyUv - 0.5;
            float angle = atan(centeredUv.y, centeredUv.x) + faceSeed * 1.5;
            float radius = length(centeredUv) - 0.1;
            float segment = 3.14159265 * 2.0 / 8.0;
            angle = mod(angle, segment);
            angle = abs(angle - segment / 2.0);
            vec2 symUv = vec2(cos(angle), sin(angle)) * radius;

            vec2 gridUv = symUv * 10.0; vec2 p = floor(gridUv); vec2 f = fract(gridUv);
            float minDist = 100.0; vec2 closestCenter = vec2(0.0);

            for(int j=-1; j<=1; j++) for(int i=-1; i<=1; i++){
                vec2 b = vec2(float(i), float(j)); vec2 h = hash2(p + b + faceSeed * 13.37); vec2 center = b + h;
                if(dot(center - f, center - f) < minDist){ minDist = dot(center - f, center - f); closestCenter = center; }
            }

            float edgeDist = 100.0;
            ${isLowEnd ? `for(int j=-1; j<=1; j++) for(int i=-1; i<=1; i++){` : `for(int j=-2; j<=2; j++) for(int i=-2; i<=2; i++){`}
                vec2 b = vec2(float(i), float(j)); vec2 h = hash2(p + b + faceSeed * 13.37); vec2 center = b + h;
                if(dot(center - closestCenter, center - closestCenter) > 0.00001) {
                    float d = dot(0.5 * (closestCenter + center) - f, normalize(center - closestCenter)); edgeDist = min(edgeDist, d);
                }
            }
            float customLead = max(smoothstep(0.03, 0.0, edgeDist), smoothstep(0.02, 0.0, min(min(vMyUv.x, 1.0 - vMyUv.x), min(vMyUv.y, 1.0 - vMyUv.y))));
            if (customLead < 0.5) discard;
      `)
    }
    
    depthMat.customProgramCacheKey = () => `vitrail_shadow_${isLowEnd ? 'low' : 'high'}`

    return { geometry: geo, material: mat, depthMaterial: depthMat }
  }, [isLowEnd]) 

  return (
    <mesh geometry={geometry} material={material} customDepthMaterial={depthMaterial} castShadow raycast={currentPhase === 3 ? undefined : () => null} />
  )
}