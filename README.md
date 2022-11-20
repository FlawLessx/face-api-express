# Documentation

### Table of contents
* [a. Prerequisites](#prerequisites)
* [B. Installation](#installation)
* [C. How to run](#how-to-run)
* [D. Handle Not Supported CPU](#handle-not-supported-cpu)
* [E. Run App As A Service](#run-app-as-a-service)

## <a name="prerequisites"></a> A. Prerequisites

- Node.js v16.17.0
- NPM v8.15.0
- Git LFS
- Python 2.7 or newer

## <a name="installation"></a> B. Installation

1. Clone this repo
2. Change to repository directory
3. Install all required package ```npm i```

## <a name="how-to-run"></a> C. How to run 

- node app.js

If app crash and returned "Illegal Insctructions (Core Dumped)", then continue on section D.

<span style="color: red;">Note: If Program running well till showing "Server started on port" then continue to section E</span>

## <a name="handle-not-supported-cpu"></a> D. Handle Not Supported CPU (Linux Only)

Prebuild tfjs-node shared object comes with optimization for avx2 computation, to check if cpu not supported run this command 

``` bash
grep flags -m1 /proc/cpuinfo | cut -d ":" -f 2 | tr '[:upper:]' '[:lower:]' | { read FLAGS; OPT="-march=native"; for flag in $FLAGS; do case "$flag" in "sse4_1" | "sse4_2" | "ssse3" | "fma" | "cx16" | "popcnt" | "avx" | "avx2") OPT+=" -m$flag";; esac; done; MODOPT=${OPT//_/\.}; echo "$MODOPT"; }
```

If there is no output like "-mavx2", run this command to used precompiled shared object without avx2 optimization

``` bash
cp build/prebuild-ubuntu.tar.gz node_modules/@tensorflow/tfjs-node/deps
tar -xf node_modules/@tensorflow/tfjs-node/deps/prebuild-ubuntu.tar.gz
```

Then try running again

## <a name="run-app-as-a-service"></a> E. Run App As A Service

If run app like section C, it will stopped if ssh connection closed or server started, so to handle that using a package named pm2.

1. Run ```npm i -g pm2```
2. ```pm2 startup```
3. ```pm2 startup systems```
4. ```systemctl status pm2-root.service```
5. ```cd/<app-directory>```
6. ```pm2 start app.js -n face-api```
7. ```pm2 save```
8. Verify ```pm2 status```

Reference: https://www.tecmint.com/enable-pm2-to-auto-start-node-js-app/
