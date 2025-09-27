MVP

1. sample with three.js (best if we would use 2d AND 3d model)
2. Writing a readme
3. Create some shaders at weekend
4. Inifinite add node would be handy

Bugs
1. Dragging multiple nodes wont update all positions in the graph
2. For some reason, some nodes are being disconnected after reopening (- node and uv)
3. When we reload shader, nodes are refreshing one by one

Small bugs
1. Weird issue with shaders blinking while saving in VSCode


Next

1. Loops validation
2. Portals
3. Matrices
4. Add all functions
5. Add any errors as vscode diagnostics


Global uniforms variables
- TODO

Optimization
1. splitting things to variables
 - when output is connected to multiple things
 - when we would want to use input more than once (is that necessary?)
 - I think that if we want to optimize, we should output an AST tree and analyze it
2. coords nodes could have a global cache
3. Three shaker for functions - now every include is added to result
4. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)
5. Memoize types
6. Optimize communication between webview and extension
7. When reapplying connections, rete is removing a connection, this causes a recompile of out node, then rete adds connection - this causes another recompile. And we are actaully recompiling all out nodes.
8. Editor is reimporting glsl on translation to editor, we could only refresh it when it gets dirty
9. Look at params getParamValue - why specialization needed?
10. Some constants/literals could be internally compiled as uniforms, so we don't need to recompile whole shader to change them

Check
1. If we don't need to inherit from rete socket


