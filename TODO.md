MVP

1. loading glsl functions from file
2. Uniforms
3. Textures

bugs
1. When changing number of outputs to fewer, you can orphan some connections (vector decompose is a good example)
2. Preview is in front of the right panel
3. When type of connection is changed, errors in nodes cause noe to be unable to be deleted
4. cannot change values in composed vectors
5. Copy & paste doesn't work in extension

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


