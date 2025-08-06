1. Look at params getParamValue
2. Loops validation
3. templated functions (add, etc)
5. Fuinctions should only accept EXACT type (implicit conversion is for rare cases, like constructors)
6. Portals
7. Undo/redo

Optimization
1. splitting things to variables
 - when output is connected to multiple things
 - when we would want to use input more than once (is that necessary?)
2. coords nodes could have a global cache
3. Three shaker for functions - now every include is added to result
4. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)
5. Memoize types

Check
1. If we don't need to inherit from rete socket

bugs
1. Fix color picker wheel
2. mix function should return x or y
3. When reapplying connections, rete is removing a conenction, this causes a recompile of out node, then rete adds connection - this causes another recompile. And we are actaully recompiling all out nodes.
4. WHen changing number of outputs to fewer, you can orphan some conenctions

Global uniforms variables
- TODO

Textures
- TODO