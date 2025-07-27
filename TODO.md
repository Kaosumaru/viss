1. splitting things to variables
 - when output is connected to multiple things
 - when we would want to use input more than once (is that necessary?)
2. More types of properties
    - colors
    - textures
3. Global uniform parameters
4. Pasting should translate nodes to current view



Optimization
1. coords nodes could have a global cache
2. Three shaker for functions - now every include is added to result
3. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)