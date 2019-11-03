const axios = require('axios'); 
const fs = require('fs');

//save urls to call API decolar
const params = []


function loop(init){
    let temp = init;  
    while(true)
    {
    temp = generate(temp);
    params.push(temp);
    if(temp == init) break;
        //console.log(temp);
    }
}
function generate(str){
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let chars = [];
    for(let i = 0; i < str.length; i++) {
      chars.push(alphabet.indexOf(str[i]));
    }
    
    for(let i = chars.length - 1; i >= 0 ; i--) {
      let tmp = chars[i];
      if(tmp >= 0 && tmp < 25) {
        chars[i]++;
        break;
      } else{chars[i] = 0;}
    }
    let newstr = "";
    for(let i = 0; i < chars.length; i++) {
      newstr += alphabet[chars[i]];
    }
    return newstr;
}

async function getAPI(params){
    try {
        const res = await axios.get(`https://www.decolar.com/suggestions?locale=pt-BR&profile=sbox-cp-vh&hint='${params}'&fields=city`);
        let data = res.data; 
            
        //scroll json with items
        for (let i = 0; i<data.items.length; i++){
            if (data.items[i].group ==='AIRPORT') {
                for (let j = 0; j<data.items.length; j++) {
                    const dado = data.items[i].items[j];
                    //create line with data 
                    let line = `${dado.id};${dado.target.gid};${dado.target.type};${JSON.stringify(dado.target.parents)};${dado.display};${JSON.stringify(dado.location)};`;        
                    return line+ "\r\n";               
                }
            }
        }           
    } catch (error) {
        console.error(error);
    }
}


//sleep to control sending requests
function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
    msleep(n*1000);
}

async function getData(){
  let count = 0;     
  for (let p of params) {
    sleep(0.5);
    if (count == 200) {
        count=0; 
        sleep(10);
    }
    let line = await getAPI(p);    
    if (line !== undefined) {
        fs.appendFile('test.txt', line, function (err) {
            if (err) throw err;            
        }); 
    }    
  }
}

//Init
loop("aaa");

//get all data
getData();
