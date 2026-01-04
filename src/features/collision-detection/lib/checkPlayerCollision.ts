import type { Monster } from '@/entities/monster'
import type { Vector3 } from '@/shared/types/common'
import { vector3Distance } from '@/shared/lib/math/vector'
import {Box3, BufferGeometry, Material, Mesh, Object3D, type Object3DEventMap} from "three";
import * as THREE from "three";

const COLLISION_DISTANCE = 1.5

export const checkPlayerCollision = (
  monsters: Monster[],
  playerMesh?:  Mesh<BufferGeometry, Material | Material[], Object3DEventMap>,
): Monster | null => {
    if(!playerMesh) return null

    const playerBox =  new THREE.Box3().setFromObject(playerMesh)

    for(const monster of monsters) {
        if(!monster.mesh)continue

        const monsterBox = new THREE.Box3().setFromObject(monster.mesh)

        if(playerBox.intersectsBox(monsterBox))return monster
    }

    return null
}
