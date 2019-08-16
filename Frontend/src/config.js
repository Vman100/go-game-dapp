const config = {
  development :{
    root : "http://localhost:3000",
    backenUrl: "http://localhost:5000/go-game-dapp/us-central1"
  },
  production: {
    root : "https://go-game-dapp.web.app",
    backenUrl: "https://us-central1-go-game-dapp.cloudfunctions.net"
  }
}

export default config;