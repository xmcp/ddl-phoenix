# Phoenix <small>from _Project Fire Bird_</small>

Online demo for PKU Helper users at https://pkuhelper.pku.edu.cn/ddl/

## Build Instruction for Self-Hosting

1. Set up your backend server (see instruction from [Bee](https://github.com/pkuhelper-web/bee))
2. `npm install`
3. Edit `src/welcomePage.example.js` to implement your token-based account system and registration system
4. Rename `src/welcomePage.example.js` to `src/welcomePage.js`
5. Edit `src/state/sister.js` and change `SISTER_ROOT` to the base URL of your backend server
6. Set `REACT_APP_BUILD_INFO` environment variable to the build version
7. `npm run build`
8. Host the `build/` folder

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.zh-cn.html) for more details.
