1. Preview in nodes
2. splitting things to variables
 - when output is connected to multimple things
 - when we would want to use input more than once (is that necessary?)
3. More types of properties
    - colors
    - textures
4. Global uniform parameters
5. Think about how multiple additions/removals should be handled


Optimization
1. coords nodes could have a global cache
2. Preview node is generating unnecessary variable - variables there should be created per output
3. Three shaker for functions - now every include is added to result
4. Right compilation of a node is stack based, we could fix that (maybe first analyze tree and compile leafs so we won't actually change internal API)