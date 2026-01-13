import { useGameStore } from '@/entities/game'
import { usePlayerStore, createPlayer } from '@/entities/player'
import type { PlayerClass } from '@/entities/player'

export const CharacterSelectionScreen = () => {
  const handleClassSelect = (playerClass: PlayerClass) => {
    // Store selected class
    useGameStore.getState().selectClass(playerClass)

    // Create player with selected class
    const player = createPlayer(playerClass)
    usePlayerStore.getState().setPlayer(player)

    // Start game
    useGameStore.getState().setState('playing')
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-4xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          캐릭터 선택
        </h1>

        <div className="flex gap-8">
          {/* Assault Class */}
          <button
            onClick={() => handleClassSelect('ASSAULT')}
            className="bg-gray-800 p-6 rounded-lg border-2 border-gray-600 hover:border-green-500 cursor-pointer transition-colors flex-1"
          >
            <div className="text-white text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">돌격병</h2>
              <p className="text-sm text-gray-300">균형잡힌 기본 클래스</p>
            </div>
            <div className="space-y-2 text-sm text-white">
              <div>• 체력: 10</div>
              <div>• 이동 속도: 보통</div>
              <div>• 총알 속도: 보통</div>
              <div>• 공격력: 1</div>
              <div>• 발사 속도: 빠름</div>
              <div>• 사정거리: 짧음 (20)</div>
              <div>• 시야 범위: 짧음 (15~30)</div>
              <div>• 관통: 없음</div>
            </div>
          </button>

          {/* Sniper Class */}
          <button
            onClick={() => handleClassSelect('SNIPER')}
            className="bg-gray-800 p-6 rounded-lg border-2 border-gray-600 hover:border-blue-500 cursor-pointer transition-colors flex-1"
          >
            <div className="text-white text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">저격수</h2>
              <p className="text-sm text-gray-300">강력한 원거리 클래스</p>
            </div>
            <div className="space-y-2 text-sm text-white">
              <div>• 체력: 7</div>
              <div>• 이동 속도: 느림</div>
              <div>• 총알 속도: 매우 빠름</div>
              <div>• 공격력: 2</div>
              <div>• 발사 속도: 느림</div>
              <div>• 사정거리: 김 (40)</div>
              <div>• 시야 범위: 넓음 (25~50)</div>
              <div>• 관통: 가능</div>
              <div className="text-yellow-400">⚠ 정지 시에만 사격</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
