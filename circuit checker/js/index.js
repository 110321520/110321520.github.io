var down_load = document.getElementById('download_c'); //下載按鈕

var canvas2 = document.getElementById('mycanvas'); //電路圖
var ctx = canvas2.getContext('2d');


var canvas1 = document.getElementById('chart'); //機率圖
var ctx3 = canvas1.getContext('2d');

var data = {labels:[],  //初始化機率圖資料
        datasets:[{
            label:'',
            data: [],
            backgroundColor:[],
            borderColor:[],
            borderWidth: 1
        }]};

var chart = new Chart(ctx3, { //先畫機率圖
        type: 'bar',
        data:data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 100
                    }
                }]
            }
        }
});

function download(){   //下載圖片
    
    var aLink = document.createElement('a');
    var aLink2 = document.createElement('a');
    var img = canvas1.toDataURL("image/jpeg");
    var img2 = canvas2.toDataURL("image/jpeg");
    var evt = new MouseEvent('click');
    var evt2 = new MouseEvent('click');

    aLink.download = 'circuit.jpg';
    aLink.href = canvas2.toDataURL();
    aLink.dispatchEvent(evt);
    
    aLink2.download = 'probability.jpg';
    aLink2.href = canvas1.toDataURL();
    aLink2.dispatchEvent(evt2);
}

function reset(){   //clear
    //window.location.reload(); 
    /*var c= document.getElementById("mycanvas");
    var cxt=c.getContext("2d");*/
    ctx.clearRect(0,0,canvas2.width,canvas2.height);
    
    down_load.disabled = true;
    data = {labels:[],
        datasets:[{
            label:'',
            data: [],
            backgroundColor:[],
            borderColor:[],
            borderWidth: 1
    }]};
    chart.config.data = data;
    chart.update();
    
    document.getElementById("circuit").value="";
    document.getElementById("gate_count").innerHTML="Gate count ： ";
    document.getElementById("truth_table").innerText="";

}

function run(){    //執行
    var gate_number=0;  //gate數量
    var bit_number=0;	//bit 數量
    var answer = [];    //經過每個gate的答案
    var hadamard = [[1,1],[1,-1]];   //hadamard 
    var I = [[1,0],[0,1]];   
    var one = [0,1];
    var zero = [1,0];
    var han = [];     //gate的矩陣
    var center = 0;   //判斷是否有限制輸入
    
    var bit_gate = document.getElementById("circuit").value.split('\n');  //取得輸入的gate
    var final_ket = document.getElementById("flexRadioDefault3");
    //var bb = document.getElementById("truth_table");
    
    down_load.disabled = false;     //將download的按鈕設為可用
    gate_number = bit_gate.length;   //計算gate的數量
    
    if (bit_gate[gate_number-1] == ''){
        gate_number-=1;
    }
    
    
    var m_bit = [];    //要測量的bit

    if (bit_gate[gate_number-1][0] == 'M'){    //看是否有 M 
        for(var i=2;i<bit_gate[gate_number-1].length;i++){
            m_bit.push(bit_gate[gate_number-1][i]);  //將要測量的bit 存起來
        }
        gate_number -=1;    //有 M 的話gate數量要減 1 
    }
    else{
        for(var i=0;i<bit_gate[gate_number-1].length;i++){
            m_bit.push((i+1));
        }
    }
    
    var aa = document.getElementById("gate_count");  //網頁顯示gate數量
    if (bit_gate[0][0] == 'I'){
        center=1;        //有限制輸入，所以center設為 1
        gate_number-=1;
        aa.innerHTML = "Gate count ： "+gate_number;
    } 
    else{
        if (bit_gate[gate_number-1] == ''){
            gate_number-=1
            aa.innerHTML = "Gate count ： "+gate_number;
        }
        else{
            aa.innerHTML = "Gate count ： "+gate_number;
        }
        
    }
    
    if (bit_gate[gate_number] != ''){  //計算bit的數量
        bit_number = bit_gate[center].length;
    }
    
    var bit_gate2 = new Array(gate_number); //存gate的陣列
    
    if (center == 1){      //將gate存起來 上下差別在是否限制輸入
        for (var i = center; i < gate_number+1; i++) {
            bit_gate2[i-1] = new Array(bit_number);
            for(var j=0;j<bit_number;j++){
                bit_gate2[i-1][j] = bit_gate[i][j];
            }
        }
    }
    else{
        for (var i = 0; i < gate_number; i++) {
            bit_gate2[i] = new Array(bit_number);
            for(var j=0;j<bit_number;j++){
                bit_gate2[i][j] = bit_gate[i][j];
            }
        }
    }
    //bb.innerText = bit_gate2;
    var bb = document.getElementById("truth_table");  //網頁上顯示結果的 Label
    bb.innerText = '';
    bb.innerText+='$$\\begin{aligned}';   //mathjax格式
    
    var k=0;
    
    var number = new Array(bit_number); //存取2進位數字
    var answer2 = [];   //存取測量的最終結果
    
    var bit_gate3 = new Array(gate_number);  //要計算的gate矩陣
    
    for(var j=0;j<gate_number;j++){  //建造gate矩陣
        
        for (var p=0;p<bit_gate2[j].length;p++){
            
            if (bit_gate2[j][p] == 'H' && p==0){
                han = hadamard;
            }
            else if(bit_gate2[j][p] == '3' && p==0){
                han = I;
            }
            else if (bit_gate2[j][p] == 'H'){
                han = closes_d(han,hadamard);   
            } 
            else if (bit_gate2[j][p] == '3'){
                han = closes_d(han,I);
            }
            else if(bit_gate2[j][p] == '2'){
                han = set_not_gate(bit_number,bit_gate2[j]); //遇到Notgaate
                break;
            }
        }
        bit_gate3[j]=han;
        han = [];
        
    }
    
    
    for( var i=0;i<Math.pow(2,bit_number);i++){   //checker
        
        k=i;
        
        answer = [];
        for(var j=0;j<bit_number;j++){ //計算二進位
            number[j] = 0
            number[j] =  parseInt(k % 2);
            k = parseInt(k/2);			
        }
        var run_number = 0;
        if (center == 1){  //如果有限制輸入，就判斷是否為限制的輸入
            for(var j=bit_number-1 ;j>=0;j--){
                if (bit_gate[0][bit_number+1-j] == '0' && number[j] == '1' || bit_gate[0][bit_number+1-j] == '1' && number[j] == '0'){ 
                    run_number = 1;
                }
            }
        }
        if (run_number == 0 && bit_number != 0){ //將輸入轉為矩陣
            for(var j=bit_number-1 ;j>=0;j--){
                bb.innerText += number[j];
                if (j==bit_number-1){
                    if(number[j] == 1){
                        answer = one;
                    }
                    else{
                        answer = zero;
                    }
                }
                else{
                    if (number[j] == 1){
                        answer = closes(answer,one);
                    }
                    else{
                        answer = closes(answer,zero);
                    }
                }
            }
            
            bb.innerText += '&=';
            if (final_ket.checked == false){
                bb.innerText += output_(answer);
            }
            
            
            
            for(var j=0;j<gate_number;j++){
                k=0;
                if (final_ket.checked == false){
                    bb.innerText += '\\\\&=';
                }
                
                
                answer = matrix_dot(bit_gate3[j],answer);    //gate與狀態的矩陣乘法
                //han = [];
                if (final_ket.checked == false){
                    bb.innerText += output_(answer);
                }
                
                
            }
            if (final_ket.checked == true){
                bb.innerText += output_(answer);
            }
            answer2.push(answer); //將最終結果存起來
            
            bb.innerText+= '\\\\'+'\\\\';
            
            
        }
        
    }
    
    bb.innerText+='\\end{aligned}$$'  //checker 判斷結束
    if (bit_number == 0){
        bb.innerText = '';
    }
    

    draw(bit_number,bit_gate2,gate_number,m_bit,bit_gate,center);  //畫圖
    if (gate_number!=0){   //如果有gate就測量
        measure(m_bit,answer2,bit_number)//測量
    }
    
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);  //更新mathjax格式
    while(bit_gate.length){
        bit_gate.pop();
    }
    while(bit_gate2.length){
        bit_gate2.pop();
    }
}

function measure(m_bit,answer,bit_number){  //測量
    
    var m_result = new Array(Math.pow(2,m_bit.length)); //測量結果
    for (var i=0;i<Math.pow(2,m_bit.length);i++){ //先將結果機率設為0
    
        m_result[i] = 0; 
    }
    var d = '';
    var a=0;
    var b=0;
    for (var k=0;k<answer.length;k++){ //計算每個狀態的次數
        for(var i=0;i<Math.pow(2,bit_number);i++){
            if (answer[k][i] == '1'||answer[k][i] == '-1'){
                d = ToBin(i);  //轉二進制
                while(Math.pow(2,d.length)< Math.pow(2,bit_number)){  //不滿bit數量要補0
                    d = '0'+ d;
                }
                for(var j=0;j<m_bit.length;j++){
                    if (d[m_bit[j]-1] == '0'){
                        a+=0;		
                    }
                    else if(d[m_bit[j]-1] == '1'){ //與d一樣的狀態+1
                        a+=Math.pow(2,m_bit.length-1-j); 
                    }
                }
                m_result[a] +=1;
                b+=1   //計算總數，方便計算機率
                a=0;
            }
            
        }
    }
    
    
    var m_name = new Array(Math.pow(2,m_bit.length)); //要畫機率圖的label
    
    var m_bg_color = new Array(Math.pow(2,m_bit.length)); 
    
    var m_b_color = new Array(Math.pow(2,m_bit.length));
    
    for(var i=0;i<Math.pow(2,m_bit.length);i++){ //處理要畫機率圖的資料
        m_result[i] =  m_result[i]/b*100;  //計算機率
        d = ToBin(i);
        while(Math.pow(2,d.length)< Math.pow(2,m_bit.length)){
            d = '0'+ d;
        }
        m_name[i] = d;
        
        m_bg_color[i] = 'rgba(255, 99, 132, 0.2)';
        m_b_color[i] = 'rgba(255,99,132,1)';
    }
    
    data = {  //畫機率圖資料
        labels:m_name,
        datasets:[{
            label:'Probability',
            data: m_result,
            backgroundColor:m_bg_color,
            borderColor:m_b_color,
            borderWidth: 1
        }]
    };
    
    chart.config.data = data; 
    chart.update(); //更新機率圖
}

function draw(bit_number,bit_gate2,gate_number,m_bit,bit_gate,center){ //畫電路圖
    
    var w = 60;
    var h = 50;
    var t = 24;
    
    
    canvas2.width = t+w*(gate_number+2);
    canvas2.height = t+h*bit_number;
    
    
    for (var i=0;i<bit_number;i++){
        ctx.beginPath();   //畫bit線
        ctx.moveTo(t/3,t/3+h*(i+1));
        ctx.lineTo(t/3+w*(gate_number+1),t/3+h*(i+1));
        ctx.strokeStyle = 'black';
        ctx.stroke();
        for (var j=0; j<gate_number;j++){ 
        
            if (i<=bit_number-1){ //畫gate直線 有notgate才要畫
                for(var k=i;k<bit_number;k++){
                    if(bit_gate2[j][i]=='0' || bit_gate2[j][i]=='1'){
                        if(bit_gate2[j][k]=='2'){
                            ctx.beginPath();
                            ctx.moveTo(t/3+w*(j+1.5),t/3+h*(i+1));
                            ctx.lineTo(t/3+w*(j+1.5),t/3+h*(k+1));
                            ctx.strokeStyle = 'black';
                            ctx.stroke();
                        }
                    }
                    else if(bit_gate2[j][i]=='2'){
                        if(bit_gate2[j][k]=='0'||bit_gate2[j][k]=='1'){
                            ctx.beginPath();
                            ctx.moveTo(t/3+w*(j+1.5),t/3+h*(i+1));
                            ctx.lineTo(t/3+w*(j+1.5),t/3+h*(k+1));
                            ctx.strokeStyle = 'black';
                            ctx.stroke();
                        }
                    }
                }
            }
            
            if (bit_gate2[j][i] == '0'){ //畫gate
                ctx.beginPath();
                ctx.arc(t/3+w*(j+1.5), t/3+h*(i+1), 8, 0,Math.PI*2, true);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();
            }
            else if(bit_gate2[j][i] == '1'){
                ctx.beginPath();
                ctx.arc(t/3+w*(j+1.5), t/3+h*(i+1), 8, 0,Math.PI*2, true);
                ctx.fillStyle = "black";
                ctx.fill();
                
                ctx.stroke();
            }
            else if(bit_gate2[j][i] == '2'){
            
                ctx.beginPath();
                ctx.moveTo(t/3+w*(j+1.5),t/3+h*(i+1)-11);
                ctx.lineTo(t/3+w*(j+1.5),t/3+h*(i+1)+11);
                ctx.strokeStyle = 'black';
                ctx.stroke();
            
                ctx.beginPath();
                ctx.arc(t/3+w*(j+1.5), t/3+h*(i+1), 11, 0,Math.PI*2, false);
                ctx.strokeStyle = 'black';
                ctx.stroke();
                
                
            }
            else if(bit_gate2[j][i] == 'H'){
                ctx.beginPath();
                ctx.strokeRect(t/3+w*(j+1.5)-11, t/3+h*(i+1)-11, 22, 22);
                ctx.clearRect(t/3+w*(j+1.5)-11, t/3+h*(i+1)-11, 22, 22);
                ctx.font = "20px Arial"
                ctx.fillStyle='black';
                ctx.fillText("H", t/3+w*(j+1.5)-7.5, t/3+h*(i+1)+7.5);
                ctx.stroke();
                
            }
        }
    }
    

    for (var i=0;i<bit_number;i++){ //畫測量的圖示 M
        ctx.beginPath();
        ctx.moveTo(t/3+w*(gate_number+1),t/3+h*(i+1));
        ctx.lineTo(t/3+w*(gate_number+2),t/3+h*(i+1));
        ctx.strokeStyle = 'black';
        ctx.stroke();
        for(var j=0;j<m_bit.length;j++){
            if(m_bit[j]==i+1){
                ctx.beginPath();
                ctx.strokeRect(t/3+w*(gate_number+1.5)-11, t/3+h*(i+1)-11, 22, 22);
                ctx.clearRect(t/3+w*(gate_number+1.5)-11, t/3+h*(i+1)-11, 22, 22);
                ctx.font = "20px Arial"
                ctx.fillStyle='black';
                ctx.fillText("M", t/3+w*(gate_number+1.5)-8.5, t/3+h*(i+1)+7.5);
                ctx.stroke();
            }
        }
    }
    
    for (var i=0;i<bit_number;i++){ //畫輸入的圖示 D
        ctx.beginPath();
        ctx.clearRect(t/3-w*0.1, t/3+h*(i+1)-11, 46, 22);
        ctx.strokeRect(t/3+w*0.5-11, t/3+h*(i+1)-11, 22, 22);
        
        ctx.font = "20px Arial"
        ctx.fillStyle='black';
        if (center==1){
            if(bit_gate[0][i+2] == 'D'){
                ctx.fillText(bit_gate[0][i+2], t/3+w*0.5-7.5, t/3+h*(i+1)+7.5);
                ctx.stroke();
            }
            else{
                ctx.fillText(bit_gate[0][i+2], t/3+w*0.5-6, t/3+h*(i+1)+7.5);
                ctx.stroke();
            }
            
        }
        else{
            ctx.fillText("D", t/3+w*0.5-7.5, t/3+h*(i+1)+7.5);
            ctx.stroke();
        }
                
            
    }
    
    
}

function closes(array2,array){ //一維 close
    let b = [];
    for (var i=0; i<array2.length;i++){
        for (var j=0;j<array.length;j++){
            b.push(array[j]*array2[i]);
        }
    }
        
    return b;

}

function closes_d(array1,array2){ //多維 close
    let a = [];
    let b = [];
    for (var k=0;k<array1.length;k++){
        for(var p=0;p<array2.length;p++){
            for(var i=0;i<array1[k].length;i++){
                for(var j=0;j<array2[p].length;j++){
                    a.push(array1[k][i]*array2[p][j]);
                }
            }
            b.push(a);
            a=[];
        }
    
    }
                            
    return b 
}

function output_(answer){  //處理輸出格式
    a=0
    b='';
    var mode = document.getElementById("flexRadioDefault1"); //看是要矩陣輸出或是ket
    //var mode2 = document.getElementById("flexRadioDefault3"); //是否要全矩陣輸出
    
    
    for(var i=0;i<answer.length;i++){ //確保矩陣的值都是1
        if (Math.abs(answer[i])>0){
            a+=1
            answer[i] /= Math.abs(answer[i]);	
        }
    } 
    
    if (mode.checked == true){ //選擇矩陣形式
        if (a==1){
            return ('['+answer+']\^T');
        }
        else{
            return ('\\frac{1}{\\sqrt{'+a.toString()+'}}'+'['+answer+']\^T')
        }
    }
    else{ //選擇ket
        
        if (a!=1){ //輸出的係數
            b+= '\\frac{1}{\\sqrt{'+a.toString()+'}}(';
        }
        c=0;
        d='';
        for(var i=0;i<answer.length;i++){ //ket處理
            if (answer[i] == -1){ //負的加負號
                    
                d = ToBin(i);
                while(Math.pow(2,d.length)< answer.length){
                    d = '0'+ d;
                }					
                if (c==0){
                    c+=1
                    b += '-|'+ d +'〉';
                }
                else{
                    b += '-|'+ d +'〉';
                }
            }
            else if (answer[i] == 1){
                    
                d = ToBin(i);
                while(Math.pow(2,d.length)< answer.length){
                    d = '0'+ d;
                }
                
                if (c==0){ //第一項是正的不用加加號
                    c+=1;
                    b += '|'+ d +'〉';
                }
                else{
                    b += '+|'+ d +'〉';
                }
            }
        }
    }
    
    
    if (a!=1){
        b+=')';
    }
    return b;	
}	

function ToBin (number) { //轉二進制程式
    let num = number;
    let binary = (num % 2).toString();
    for (; num > 1; ) {
        num = parseInt(num / 2);
        binary =  (num % 2) + (binary);
    }
    return binary;
}

function set_not_gate(bit_number,gate){ //得到notgate的矩陣
    let a=[],b=[];
    var k = new Array(Math.pow(2,bit_number)).fill(0); //建造全0的二維矩陣且是 2^bit_number * 2^bit_number
    
    for (var i=0;i<Math.pow(2,bit_number);i++){
        k[i] = new Array(Math.pow(2,bit_number)).fill(0);
    }
    
    for (var i=0;i<Math.pow(2,bit_number);i++){  
        var bb = i;
        for (var j=0;j<bit_number;j++){ //二進制
            a.push(parseInt(bb%2));
            bb/=2;
        }
        var c=0;

        for(var j=0;j<bit_number;j++){ //判斷是否要not
            if ((a[j]==1 && gate[bit_number-1-j] == 0) || (a[j] == 0 && gate[bit_number-1-j] == 1)){
                c=1;
            }
        }
        
        for(var j=0;j<bit_number;j++){
            if (gate[j]==2 && c==0){  //c是0的話要not
                if (a[bit_number-1-j] == 0){
                    a[bit_number-1-j] = 1;
                }
                else{
                    a[bit_number-1-j] = 0;
                }
            }
        }
        c=0;
        for(var j=0;j<bit_number;j++){  //計算矩陣第幾項要改變
            c+=Math.pow(2,j)*a[j];
        }
        b.push(c);
        a=[];
    }
    for (var i=0;i<Math.pow(2,bit_number);i++){ //建立notgate矩陣
        for (var j=0;j<Math.pow(2,bit_number);j++){
            if (b[j] == i){
                k[i][j] = 1;
            }
        }
    }

    return k;
}


function matrix_dot(array1,array2){ //矩陣乘法
    
    var a=[];
    var c=0;
    for (var i=0;i<array1.length;i++){
        for (var j=0;j<array2.length;j++){
            c+=array1[i][j]*array2[j];
        }
        a.push(c);
        c=0;
    }

    return a;
}
