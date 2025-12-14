import { useGameStore } from '@/entities/game'

export const ScoreBoard = () => {
  const { score } = useGameStore()

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
      <div className="text-2xl font-bold">Score: {score}</div>
    </div>
  )
}
