import React, { useRef, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { useFBX, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Extend the FBXLoader into the THREE namespace
extend({ FBXLoader });

const FBXModel = ({ file }: { file: string }) => {
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX(file);
  const { actions, mixer } = useAnimations(fbx.animations, group);

  useEffect(() => {
    if (actions && fbx.animations.length > 0) {
      console.log(`Loaded animations for ${file}:`, fbx.animations);
      mixer.stopAllAction();
      const action = actions[fbx.animations[0].name];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity); // Set the animation to loop indefinitely
      }
    } else {
      console.error(`No animations found for ${file}`);
    }
  }, [actions, fbx.animations, mixer, file]);

  useFrame((state, delta) => mixer.update(delta));

  return (
    <group ref={group}>
      <primitive object={fbx} scale={3} /> {/* Increased scale for larger size */}
    </group>
  );
};

export default FBXModel;