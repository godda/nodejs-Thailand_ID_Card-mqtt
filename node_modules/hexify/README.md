# hexify

  Hex conversion utils.

  [![Build Status](https://travis-ci.org/tomkp/hexify.png)](https://travis-ci.org/tomkp/hexify)


## examples:


```javascript
  hexify.toHexString([0x00, 0xFF, 0x6C, 0x0A]) === '00ff6c0a'
```

```javascript
  hexify.toByteArray('00ff6c0a') === [0x00, 0xFF, 0x6C, 0x0A]
```



