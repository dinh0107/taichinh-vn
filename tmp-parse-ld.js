const fs = require("fs");
const html = fs.readFileSync(process.env.TEMP + "/art.html", "utf8");
const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(html))) {
  const j = JSON.parse(m[1]);
  console.log("TYPE:", j["@type"]);
  console.log(JSON.stringify(j, null, 2));
  console.log("---");
}
