import { getConnectedPlayers, getPlayerData, getPlayersInScene } from '~system/Players'
import { sceneSystems } from '../system'

export function main(): void {
  sceneSystems.addSystemWithInverval(
    (dt) => {
      getConnectedPlayers({})
        .then((data) => {
          console.log({ getConnectedPlayers: { players: data.players } })
        })
        .catch(console.error)

        
      getPlayersInScene({})
        .then((data) => {
          console.log({ getConnectedPlayers: { players: data.players } })

          if (data.players.length > 0) {
            getPlayerData({ userId: data.players[0].userId })
              .then((data) => {
                console.log({ getPlayerData: { player: data.data } })
              })
              .catch(console.error)
          }
        })
        .catch(console.error)
    },
    1,
    'player-api-system'
  )
}
