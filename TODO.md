MVP

1. Inifinite add node would be handy

Bugs
1. When we reload shader, nodes are refreshing one by one

Small bugs
1. Weird issue with shaders blinking while saving in VSCode
2. Second tab in shader causes NaN to show up
3. Writing -0 removes -

Next

1. Loops validation
2. Portals
3. Matrices
4. Add all functions
5. Add any errors as vscode diagnostics
6. three js Sample with 3d model


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
5. Optimize communication between webview and extension
6. When reapplying connections, rete is removing a connection, this causes a recompile of out node, then rete adds connection - this causes another recompile. And we are actaully recompiling all out nodes.
7. Editor is reimporting glsl on translation to editor, we could only refresh it when it gets dirty
8. Look at params getParamValue - why specialization needed?
9. Some constants/literals could be internally compiled as uniforms, so we don't need to recompile whole shader to change them
10. When loading graph, we are getting node info twice per node

Check
1. If we don't need to inherit from rete socket


