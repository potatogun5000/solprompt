import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  const obj = {};
  const rows = await db.all("SELECT * FROM tags");


  rows.forEach( r => {
    if(obj.hasOwnProperty(r.text)){
      obj[r.text] += 1;
    }else{
      obj[r.text] = 1;
    }
  })


  let arr = [];
  Object.keys(obj).forEach( key => {
    arr.push({
      text: key,
      amount: obj[key]
    })
  })

  const str = arr.sort((a,b)=>b.amount-a.amount).map(a=>a.text).join(",");

  require('fs').writeFileSync('./tags-auto.json', str);
})();
