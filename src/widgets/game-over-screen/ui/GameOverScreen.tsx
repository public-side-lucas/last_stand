import { useGameStore } from '@/entities/game'
import { useMonsterStore } from '@/entities/monster'
import { useBulletStore } from '@/entities/bullet'
import { usePlayerStore } from '@/entities/player'

export const GameOverScreen = () => {
  const { score, resetGame } = useGameStore()
  const { clearMonsters } = useMonsterStore()
  const { clearBullets } = useBulletStore()
  const { setPlayer } = usePlayerStore()

  const handleRestart = () => {
    // Clear all game state
    setPlayer(null)
    clearMonsters()
    clearBullets()
    resetGame() // Goes to character select screen
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white p-8 rounded-lg text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Game Over</h1>
        <p className="text-2xl mb-6">Final Score: {score}</p>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Restart
        </button>
      </div>
    </div>
  )
}
