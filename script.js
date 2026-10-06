let S=JSON.parse(localStorage.S||"[]");
let H=JSON.parse(localStorage.H||"[]");
let P=JSON.parse(localStorage.P||"[]");

let defaultCriteria=[
{m:90,g:"A+",p:4},
{m:85,g:"A",p:4},
{m:80,g:"A-",p:3.7},
{m:75,g:"B+",p:3.5},
{m:70,g:"B",p:3},
{m:65,g:"B-",p:2.7},
{m:60,g:"C+",p:2.5},
{m:55,g:"C",p:2},
{m:50,g:"D",p:1},
{m:0,g:"F",p:0}
];

let C=JSON.parse(localStorage.C||JSON.stringify(defaultCriteria));

function page(id,b){
document.querySelectorAll(".pg").forEach(x=>x.style.display="none");
document.getElementById(id).style.display="block";
document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
if(b)b.classList.add("active")
}

function dark(){
document.body.classList.toggle("dark");
localStorage.dark=document.body.classList.contains("dark")
}

if(localStorage.dark=="true")dark();

function toast(msg){
let t=document.getElementById("toast");
t.textContent=msg;
t.classList.add("show");
setTimeout(()=>t.classList.remove("show"),2500)
}

function G(p){
for(let x of C){
if(p>=x.m)return[x.g,x.p]
}
return["F",0]
}

function criteriaText(){
return C.filter(x=>x.m>0)
.map(x=>`${x.m}:${x.g}:${x.p}`)
.join(",")
}

function saveCriteria(){

let text=document.getElementById("criteria").value.trim();

if(!text)text=document.getElementById("criteria2").value.trim();

let arr=[];

try{

text.split(",").forEach(x=>{

let a=x.trim().split(":");

if(a.length==3){

let m=Number(a[0]);
let g=a[1].trim();
let p=Number(a[2]);

if(!isNaN(m)&&!isNaN(p))
arr.push({m,g,p});

}

});

if(!arr.length)throw Error();

arr.sort((a,b)=>b.m-a.m);
arr.push({m:0,g:"F",p:0});

C=arr;

localStorage.C=JSON.stringify(C);

document.getElementById("criteria").value=criteriaText();
document.getElementById("criteria2").value=criteriaText();

toast("Grading criteria saved successfully!");

render();

}catch(e){
toast("Please enter criteria in correct format.");
}

}

function add(){
S.push({n:"New Subject",c:3,t:100,o:0});
save();
render()
}

function save(){
localStorage.S=JSON.stringify(S)
}

function edit(i,k,v){
S[i][k]=k=="n"?v:+v;
save();
render()
}

function remove(i){
S.splice(i,1);
save();
render()
}

function render(){

let html="",tm=0,om=0,cr=0,pts=0;

let count={};

C.forEach(x=>count[x.g]=0);

S.forEach((s,i)=>{

let p=s.t?s.o/s.t*100:0;
let g=G(p);

tm+=s.t;
om+=s.o;
cr+=s.c;
pts+=g[1]*s.c;

if(count[g[0]]!==undefined)count[g[0]]++;

html+=`
<tr>
<td>${i+1}</td>
<td><input value="${s.n}" onchange="edit(${i},'n',this.value)"></td>
<td><input type="number" value="${s.c}" onchange="edit(${i},'c',this.value)"></td>
<td><input type="number" value="${s.t}" onchange="edit(${i},'t',this.value)"></td>
<td><input type="number" value="${s.o}" onchange="edit(${i},'o',this.value)"></td>
<td>${p.toFixed(1)}%</td>
<td>${g[0]}</td>
<td>${g[1].toFixed(2)}</td>
<td><button class="del" onclick="remove(${i})">🗑</button></td>
</tr>`
});

document.getElementById("rows").innerHTML=html;

let p=tm?om/tm*100:0;
let gpa=cr?pts/cr:0;

let hc=H.reduce((a,x)=>a+x.c,0);
let hp=H.reduce((a,x)=>a+x.g*x.c,0);

let cg=hc+cr?(hp+pts)/(hc+cr):gpa;

document.getElementById("gpa").textContent=gpa.toFixed(2);
document.getElementById("g2").textContent=gpa.toFixed(2);

document.getElementById("cgpa").textContent=cg.toFixed(2);
document.getElementById("c2").textContent=cg.toFixed(2);

document.getElementById("credit").textContent=cr+hc;
document.getElementById("per").textContent=p.toFixed(1)+"%";

document.getElementById("tm").textContent=tm;
document.getElementById("om").textContent=om;
document.getElementById("rm").textContent=tm-om;

document.getElementById("circle").textContent=p.toFixed(1)+"%";

document.getElementById("fc").textContent=cr;
document.getElementById("ft").textContent=tm;
document.getElementById("fo").textContent=om;

let deg=Math.min(p,100)*3.6;

document.querySelector(".circle").style.background=
`conic-gradient(#16b67a ${deg}deg,#e7edf3 ${deg}deg)`;

let labels=C.filter(x=>x.m>0).map(x=>x.g);
let mx=Math.max(...labels.map(x=>count[x]),1);

document.getElementById("graph").innerHTML=labels.map(x=>
`<div class="bar">
<i style="--h:${count[x]/mx*120}px"></i>
${count[x]}<br>${x}
</div>`
).join("");

}

function semester(){

let n=sn.value;
let g=+sg.value;
let c=+sc.value;

if(!n||!g||!c){
toast("Please enter semester, GPA and credits.");
return
}

H.push({n,g,c});

localStorage.H=JSON.stringify(H);

sn.value="";
sg.value="";
sc.value="";

historyView();
render();

toast("Semester added successfully!");

}

function historyView(){

hist.innerHTML=H.map((x,i)=>
`
<tr>
<td>${x.n}</td>
<td>${x.g.toFixed(2)}</td>
<td>${x.c}</td>
<td>
<button class="del"
onclick="H.splice(${i},1);localStorage.H=JSON.stringify(H);historyView();render()">
🗑
</button>
</td>
</tr>
`
).join("")
}

function target(){

let c=+cc.value;
let co=+completed.value;
let t=+tg.value;
let n=+next.value;

if(!n){
tr.textContent="Enter next semester credits.";
return
}

let r=(t*(co+n)-c*co)/n;

tr.textContent=
r>4
?"Required GPA is above 4.00"
:r<0
?"Target already achieved"
:"Required GPA: "+r.toFixed(2);

}

function saveInfo(){

["name","roll","sem","dept","uni","year"].forEach(x=>{
localStorage[x]=document.getElementById(x).value
});

toast("Student information saved successfully!");

}

function saveStudent(){

P.push({
n:name.value||"Unknown",
r:roll.value||"-",
g:cgpa.textContent
});

localStorage.P=JSON.stringify(P);

savedView();

toast("Student saved successfully!");

}

function savedView(){

let q=(search.value||"").toLowerCase();

saveRows.innerHTML=P
.map((x,i)=>({...x,i}))
.filter(x=>(x.n+x.r).toLowerCase().includes(q))
.map(x=>
`
<tr>
<td>${x.i+1}</td>
<td>${x.n}</td>
<td>${x.r}</td>
<td>${x.g}</td>
<td>
<button class="del"
onclick="P.splice(${x.i},1);localStorage.P=JSON.stringify(P);savedView()">
🗑
</button>
</td>
</tr>
`
).join("")
}

function result(){
window.print()
}

["name","roll","sem","dept","uni","year"].forEach(x=>{
if(localStorage[x])
document.getElementById(x).value=localStorage[x]
});

document.getElementById("criteria").value=criteriaText();
document.getElementById("criteria2").value=criteriaText();

render();
historyView();
savedView();