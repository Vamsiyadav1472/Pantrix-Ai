require('@babel/register')({
  presets: ['babel-preset-expo']
});
try {
  require('./screens/AddItemScreen.js');
  console.log("SUCCESS");
} catch(e) {
  console.error("FAILED:", e);
}
