# Phoenix <small>from _Project Fire Bird_</small>

Online demo for PKU Helper users at https://pkuhelper.pku.edu.cn/ddl/

## Build Instruction for Self-Hosting

1. Set up your backend server (see instruction from [Bee](https://github.com/pkuhelper-web/bee))
2. `npm install`
3. Edit `src/welcomePage.example.js` to implement your token-based account system and registration system
4. Rename `src/welcomePage.example.js` to `src/welcomePage.js`
5. Edit `src/state/sister.js` and change `SISTER_ROOT` to the base URL of your backend server
6. `npm run build`
7. Host the `build/` folder