import { useGameStore } from '@/entities/game'
import { GameCanvas } from '@/widgets/game-canvas'
import { ScoreBoard } from '@/widgets/score-board'
import { GameOverScreen } from '@/widgets/game-over-screen'
import { CharacterSelectionScreen } from '@/widgets/character-selection-screen'

export const GamePage = () => {
  const { state, startGame } = useGameStore()

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {state === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-8">Last Stand</h1>
            <p className="text-xl text-gray-300 mb-4">Defend your position against endless waves</p>
            <button
              onClick={() => startGame()}
              className="px-8 py-4 bg-green-500 text-white text-xl rounded-lg hover:bg-green-600 transition-colors"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {state === 'characterSelect' && <CharacterSelectionScreen />}

      {state === 'playing' && (
        <>
          <GameCanvas />
          <ScoreBoard />
        </>
      )}

      {state === 'gameOver' && <GameOverScreen />}
    </div>
  )
}
