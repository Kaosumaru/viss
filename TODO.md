MVP

1. loading glsl functions from file
    - how this should work in vscode? Select folder, select file?
        - selecting files would be simplest for now - just a separate list of files after uniforms
2. Uniforms
    - initial support for uniform is ready, but I'm only handling float now
3. Textures
    - initial support ready
    - we need to check if multiple textures are working (probably not right now, we arent switching textures)
    - add support to select file in vscode
        - basics are working, we need to change paths to relative, and translate them by the extension
4. sample with three.js (best if we would use 2d AND 3d model)

bugs
1. When changing number of outputs to fewer, you can orphan some connections (vector decompose is a good example)
2. When type of connection is changed, errors in nodes cause noe to be unable to be deleted
3. Copy & paste doesn't work in extension
4. graphs don't load in vscode

Next

1. Loops validation
2. Portals
3. Matrices
4. Add all functions


Global uniforms variables
- TODO

Textures
- TODO

Optimization
1. splitting things to variables
 - when output is connected to multiple things
 - when we would want to use input more than once (is that necessary?)
2. coords nodes could have a global cache
3. Three shaker for functions - now every include is added to result
4. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)
5. Memoize types
6. Optimize communication between webview and extension
7. When reapplying connections, rete is removing a conenction, this causes a recompile of out node, then rete adds connection - this causes another recompile. And we are actaully recompiling all out nodes.
8. Editor is reimporting glsl on translation to editor, we could only refresh it when it gets dirty
9. Look at params getParamValue - why specialization needed?

Check
1. If we don't need to inherit from rete socket


