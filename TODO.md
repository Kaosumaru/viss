1. splitting things to variables
 - when output is connected to multiple things
 - when we would want to use input more than once (is that necessary?)
2. More types of properties
    - textures
3. Global uniform parameters
4. Look at params getParamValue
5. Loops validation
6. templated functions (add, etc)
7. Error messages on nodes

Optimization
1. coords nodes could have a global cache
2. Three shaker for functions - now every include is added to result
3. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)

Check
1. If we don't need to onherint from rete socket

bugs
1. Fix color picker wheel
2. mix function should return x or y
3. When reapplying connections, rete is removing a conenction, this causes a recompile of out node, then rete adds connection - this causes another recompile