1. splitting things to variables
 - when output is connected to multiple things
 - when we would want to use input more than once (is that necessary?)
2. More types of properties
    - textures
3. Global uniform parameters
4. Pasting should translate nodes to current view
5. Look at params getParamValue
6. Node selection + drag via right mouse button
7. Colored pins, displaying types, validation
8. Loops validation
9. templated functions (add, etc)
10. Error messages on nodes
11. Can we move compiler/graph above, so graph isn't cleared on every hot reload?

Optimization
1. coords nodes could have a global cache
2. Three shaker for functions - now every include is added to result
3. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)

bugs
1. Fix color picker wheel
2. mix function should return x or y