const Array = mrequire("core:Native.Data.Array:1.1.0");


//- Folds all of the elements from the right.
//= foldr :: b -> (a -> b -> b) -> Array a -> b
Array.foldr = z => f => a => {
    let result = z;
    for (let lp = a.length - 1; lp >= 0; lp -= 1) {
        result = f(a[lp])(result);
    }
    return result;
};


// Same as map but the function is also applied to the index of each element (starting at zero).
//= indexedMap :: (Int -> a -> b) -> Array a -> Array b
Array.indexedMap = f => a => {
    const adaptor = (value, index) =>
        f(index)(value);

    return a.map(adaptor);
};


// Set the element at a particular index. Returns an updated array. If the index is out of range, the array is
// unaltered.
//= set :: Int -> a -> Array a
Array.set = index => value => a =>
    (index >= 0 && index < Array.length(a))
        ? Array.concat(Array.append(value)(Array.slice(0)(index)(a)))(Array.drop(index + 1)(a))
        : a;
assumptionEqual(Array.set(-1)(9)([0, 1, 2, 3, 4]), [0, 1, 2, 3, 4]);
assumptionEqual(Array.set(10)(9)([0, 1, 2, 3, 4]), [0, 1, 2, 3, 4]);
assumptionEqual(Array.set(0)(9)([0, 1, 2, 3, 4]), [9, 1, 2, 3, 4]);
assumptionEqual(Array.set(3)(9)([0, 1, 2, 3, 4]), [0, 1, 2, 9, 4]);
assumptionEqual(Array.set(4)(9)([0, 1, 2, 3, 4]), [0, 1, 2, 3, 9]);


// Flatten an array.
//= flatten :: Array Array a => Array a
Array.flatten = a =>
    a.reduce((x, y) => x.concat(y));
assumptionEqual(Array.flatten([[]]), []);
assumptionEqual(Array.flatten([[1], [], [2, 3]]), [1, 2, 3]);


module.exports = Array;