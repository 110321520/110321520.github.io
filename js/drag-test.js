
// 看有要畫幾條線(幾個qubit)
var max_qubit = 15;
function draw_line(){
    const line_number = document.getElementById('line_number').value;
    if (line_number <= max_qubit){
        document.getElementById("circuit_area").innerHTML = null;

        for(var i=0; i<line_number; i++){
            let newdiv = document.createElement("div") 
            newdiv.className = "div_container_drag"
            document.getElementById("circuit_area").appendChild(newdiv);
        }

        const draggables = document.querySelectorAll('.draggable')
        const containers = document.querySelectorAll('.div_container_drag')
        let draggingTarget = null;

        // 看圖例有沒有被拖動
        draggables.forEach(draggable =>{
            draggable.addEventListener('dragstart', e=>{
                draggingTarget = e.target;
                draggable.classList.add('dragging')
            })

            draggable.addEventListener('dragend', ()=>{
                draggable.classList.remove('dragging')
            })
        })

        containers.forEach(container =>{
            container.addEventListener('drop', e =>{
                e.preventDefault();
                e.stopPropagation(); 

                const afterElement = getDragAfterElement(container, e.clientX);
                if (afterElement == null) {
                    if ( draggingTarget.className == "draggable dragging" ) {
                        let newnode = draggingTarget.cloneNode(true);
                        newnode.className = "draggable draggable_in_container";
                        container.appendChild(newnode);
                    } else {
                        container.appendChild(draggingTarget);
                    }
                } else {  //如果在其他物件的左邊，就會插入在那個物件的左邊
                    if ( draggingTarget.className == "draggable dragging" ) {
                        let newnode = draggingTarget.cloneNode(true);
                        newnode.className = "draggable draggable_in_container";
                        container.insertBefore(newnode, afterElement);
                    } else {
                        container.insertBefore(draggingTarget, afterElement);
                    }
                }
                Draw_to_inputString();
                Judgment_is_gate();
            })
            // dragover一定要放，不然會出事，他會放不了，但具體原因不知道
            container.addEventListener('dragover', e=>{
                e.preventDefault();
                e.stopPropagation(); 
            })

            container.addEventListener('dragstart', e => {
                draggingTarget = e.target;
                draggingTarget.classList.add('dragging')
            })

            container.addEventListener('dragend', ()=>{
                draggingTarget.classList.remove('dragging')
            })
            container.addEventListener('click', e => {
                if ( e.target.classList.contains('chosen') )
                    e.target.classList.remove('chosen');
                else 
                    e.target.classList.add('chosen');

                console.log(e.target);

            
            })
        })

        document.addEventListener('keydown', function(e){
            if ( e.key === 'Delete' || e.key === 'Backspace'){
                $('.chosen').remove();
                Draw_to_inputString();
                Judgment_is_gate();
            }
        })

        function getDragAfterElement(container, x){
            const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]
            // const draggableElements = [...container.querySelectorAll('.draggable.draggable_in_container:not(.dragging)')]
            // console.log(draggableElements);
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect()
                const offset = x - box.left - box.width / 2  //如果比那個物件還要左邊的話，offset就會是負的
                // console.log(offset)
                if (offset < 0 && offset > closest.offset){
                    return {offset: offset, element: child}
                }else{
                    return closest
                }

            }, {offset: Number.NEGATIVE_INFINITY}).element

        }
    }
}

// function drag_calculate(){
//畫圖的轉換成input的形式(string)
function Draw_to_inputString(){
    //先將圖片轉成一個string
    let input_string = '';
    let tem_string = '';
    let get_containers = document.getElementsByClassName('div_container_drag');
    let num = get_containers.length;
    for(let i=0; i<num-1; i++){
        let get_img = get_containers[i].getElementsByClassName('draggable');
        for(let j=0; j<get_img.length; j++){
            // console.log(get_img[j].id)
            tem_string = tem_string + judgment_img_number(get_img[j].id);
        }
        tem_string = tem_string + '\n';
    }
    let get_img = get_containers[num-1].getElementsByClassName('draggable');
    for(let j=0; j<get_img.length; j++){
        tem_string = tem_string + judgment_img_number(get_img[j].id);
    }

    //將上面的string轉換成跟input一樣的格式
    tem_string = tem_string.split('\n');
    let gate_number = tem_string.length;
    let max_length = Max_length(tem_string); 
    for(let j=0; j < max_length-1; j++){
        for(let i=0; i<gate_number; i++){
            if (tem_string[i][j] != null)
                input_string = input_string + tem_string[i][j]
            else
                input_string = input_string + '3';
        }
        input_string = input_string + '\n';
    }
        for(let i=0; i<gate_number; i++){
            if (tem_string[i][max_length-1] != null)
                input_string = input_string + tem_string[i][max_length-1]
            else
                input_string = input_string + '3';
        }
    document.getElementById("circuit").value = input_string;
}

function judgment_img_number(img_name) {
    if (img_name === 'img_cb0') 
        return '0';
    else if (img_name === 'img_cb1') 
        return '1';
    else if (img_name === 'img_nb') 
        return '2';
    else if (img_name === 'img_cpb') 
        return '3';
    else if (img_name === 'img_ham') 
        return 'H'
    else 
        console.log(img_name);
}

function Max_length(tem_string){
    let max_length = 0;
    for (let x=0; x < tem_string.length; x++) {
        if (max_length < tem_string[x].length)
            max_length = tem_string[x].length;
    }
    // console.log(max_length);
    return max_length
}

function Judgment_is_gate(){
    let tmp = document.getElementById('circuit').value.split('\n');
    // let drag_area_div = document.getElementById('circuit_area');
    let drag_area_div = document.querySelectorAll('.div_container_drag');
    // console.log(drag_area_div);
    for (let r=0; r < tmp.length; r++) {

        // console.log(drag_area_div.item[r])
        // console.log(drag_area_div[r]);
        // let drag_area_div_child = drag_area_div[r].querySelectorAll('.draggable_in_container')
        let max = -1;
        let min = max_qubit;
        for(let p=0; p < tmp[r].length; p++) {
            if (tmp[r][p] === '2') {
                // max = -1;
                // min = max_qubit;
                //尋找要畫線GATE的最上(小)&最下面(大)bit
                for (let q=0; q < tmp[r].length; q++) {
                    if (q != p) {
                        if (tmp[r][q] === '0' || tmp[r][q] === '1') {
                            if (p > q) {
                                if (p > max)
                                    max = p;
                                if (q < min)
                                    min = q;
                            } else if (p < q) {
                                if (q > max)
                                    max = q;
                                if (p < min)
                                    min = p;    
                            }
                            console.log(p, q);

                            // 畫直線
                            //最上面的區塊
                            
                        }
                    }
                }
            }
        }
        
        let drag_area_div_child = drag_area_div[min].querySelectorAll('.draggable_in_container')
        drag_area_div_child[r].classList.add('connect_gateline_up');
        drag_area_div_child[r].classList.remove('connect_gateline_middle');
        drag_area_div_child[r].classList.remove('connect_gateline_down');

        for (let a = min+1; a < max; a++) {
            drag_area_div_child = drag_area_div[a].querySelectorAll('.draggable_in_container')
            drag_area_div_child[r].classList.add('connect_gateline_middle');
            drag_area_div_child[r].classList.remove('connect_gateline_up');
            drag_area_div_child[r].classList.remove('connect_gateline_down');
        }
        drag_area_div_child = drag_area_div[max].querySelectorAll('.draggable_in_container');
        drag_area_div_child[r].classList.add('connect_gateline_down');
        drag_area_div_child[r].classList.remove('connect_gateline_up');
        drag_area_div_child[r].classList.remove('connect_gateline_middle');
    }
}