var fly = null;
var bulletTimer = null;//自动创建子弹
var monsterTimer = null;//自动创建怪物
var bulletShutTimer = {};//自动飞行
var monsterMoveTimer = {};//怪物移动
var bulletShutNum = 0;//自动数量
var monsterNum = 0;
var maxMonsterBoold = 20;//怪物最大血量
var minMonsterBoold = 1;//怪物最小血量
var score = 0;//分数
var rankNum = 1;//排名
(function(){
	initFly();
})();
function initFly(){
	fly = new Fly();
}
//战斗机对象
function Fly(){
	score = 0;
	var flyHtml = document.createElement("div");
	flyHtml.className="fly";
	document.getElementsByTagName("body")[0].append(flyHtml);

	flyHtml.onmousedown = function(ev){//飞机移动
		beginShut();//开始射击
		buildMonster();//开始生成怪物
		console.log(ev);
        //给可视区域添加鼠标的移动事件
        document.onmousemove = function(ev){
         	var left =  ev.clientX;
			var top =  ev.clientY;
			var width = flyHtml.offsetWidth;
			var height = flyHtml.offsetHeight;
			flyHtml.style.left = left-width/2+25+"px";
			flyHtml.style.top = top-height/2+"px";
        }

        //清除
        document.onmouseup = function(ev){

            document.onmousemove = null;

        }		
	}
	function beginShut(){//自动射击
		bulletTimer = setInterval(function(){
			var bullet = new Bullet();
			var x = parseFloat(flyHtml.style.left);
			var y = parseFloat(flyHtml.style.top)-25;
			bullet.begin(x,y);
		},100);		
	}
	function buildMonster(){
		monsterTimer = setInterval(function(){
			var monster = new Monster();
		},500)	
	}
	
	this.blood = 3;
	this.beginShut = beginShut;
	this.flyDown = function(){

		clearInterval(bulletTimer);
		clearInterval(monsterTimer);
		for(var key in bulletShutTimer){
			if(bulletShutTimer[key]){
				clearInterval(bulletShutTimer[key]); 
			}			
		}
		for(var key in monsterMoveTimer){
			if(monsterMoveTimer[key]){
				clearInterval(monsterMoveTimer[key]); 
			}			
		}
		var rank = localStorage.rank;
		if(rank){
			var rankData = JSON.parse(rank);
			rankData.push({score:score,name:""});
			rankNum = rankData.length+1
			for(var i=0;i<rankData.length-1;i++){
				if(rankData[i].score>=score&&rankData[i+1].score<score){
					//从大往小排，如果发现小于前一位，并且大于后一位，则插入其中
					insertArr(rankData,i+1,{score:score,name:""});
					rankNum = i+1;
				}
			}
			localStorage.rank = JSON.stringify(rankData);
		}else{
			rankData = [{score:score,name:""}];
			localStorage.rank = JSON.stringify(rankData);
		}
		alert("游戏结束，分数为"+score+",排名位"+rankNum+"！");
		document.getElementsByTagName("body")[0].innerHTML="";
		fly = new Fly();
	}
}
//子弹对象
function Bullet(){
	this.bulletShutNum = bulletShutNum;
	this.begin = function(x,y){
		bulletShutNum++;
		var bulletHtml = document.createElement("div");
		bulletHtml.className = "bullet";
		bulletHtml.style.left = x+"px";
		bulletHtml.style.top = y+"px";		
		bulletHtml.parentNode = document.getElementsByTagName("body")[0];
		bulletHtml.setAttribute("index",bulletShutNum);
		document.getElementsByTagName("body")[0].append(bulletHtml);
		shutBullet(bulletHtml,bulletShutNum);
		
		
	}
	function shutBullet(bulletEle,bulletNum){
		bulletShutTimer[bulletNum] = setInterval(
			function(){
				if(!bulletEle){
					return;
				}
				var nowY = parseFloat(bulletEle.style.top);
				if(nowY<=-10){
					if(bulletEle.parentNode){
						bulletEle.parentNode.removeChild(bulletEle);
					}
					bulletEle = null;
					bulletShutTimer[bulletNum] = null;
				}else{
					bulletEle.style.top = nowY-50+"px";
				}				
			},100)
		
	}

}
//怪物对象
function Monster(){
	monsterNum++;
	this.monsterNum = monsterNum;
	var monsterHtml = document.createElement("div");
	this.mousterBooldNum = parseInt(minMonsterBoold+Math.random()*(maxMonsterBoold-minMonsterBoold));//怪物血量
	monsterHtml.innerHTML = this.mousterBooldNum;
	switch (this.mousterBooldNum){
		case 1:
		case 2:
		case 3:
		case 4:
			monsterHtml.className = "monster green";			
			break;
		case 5:
		case 6:
		case 7:
		case 8:
			monsterHtml.className = "monster yellow";			
			break;
		default:
			monsterHtml.className = "monster red";			
			break;
	}
	//随机生成 left的坐标
	var bodyWidth = document.getElementsByTagName("body")[0].offsetWidth;
	var left = parseInt(25+Math.random()*(bodyWidth-50));
	var top = -50;
	monsterHtml.style.left = left+"px";
	monsterHtml.style.top = top+"px";
	monsterHtml.setAttribute("monsterNum",monsterNum);
	document.getElementsByTagName("body")[0].append(monsterHtml);
	beginMove(monsterHtml,monsterNum);
	//setInterval(beginMove(monsterHtml,monsterNum),100);
	
	function beginMove(monsterHtml,monsterNum){
		monsterMoveTimer[monsterNum] = setInterval(
			function(){
				if(!monsterHtml){
					return;
				}
				shuted(monsterHtml);
				var nowY = parseFloat(monsterHtml.style.top);
				var maxHeight = document.getElementsByTagName("body")[0].offsetHeight
				if(nowY>=maxHeight){
					fly.blood --;
					if(fly.blood<=0){
						fly.flyDown();
					}
					if(monsterHtml.parentNode){
						monsterHtml.parentNode.removeChild(monsterHtml);
					}
					monsterHtml = null;
					monsterMoveTimer[monsterNum] = null;
				}else{
					monsterHtml.style.top = nowY+5+"px";
				}				
			},100)
	}
	//子弹打到怪物
	function shuted(monsterEle){
		if(!monsterEle){
			return ;
		}
		var left = parseInt(monsterEle.style.left);
		var top = parseInt(monsterEle.style.top);
		var width = parseInt(monsterEle.offsetWidth);
		var height = parseInt(monsterEle.offsetHeight);
		var bullets = document.getElementsByClassName("bullet");
		for(var i=0;i<bullets.length;i++){
			var bulletsLeft = parseInt(bullets[i].style.left);
			var bulletsTop = parseInt(bullets[i].style.top);
			var bulletsWidth = parseInt(bullets[i].offsetWidth);
			var bulletsHeight = parseInt(bullets[i].offsetHeight);
			
			if(left+width>bulletsLeft&&left<bulletsLeft+bulletsWidth&&top+height>bulletsTop&&top<bulletsTop+bulletsHeight){
				//撞到了。
				score++;
				var mousterNum = monsterEle.getAttribute("monsterNum");
				var mousterBoold = monsterEle.innerHTML;
				if(mousterBoold<=0){
					if(monsterEle.parentNode){
						monsterEle.parentNode.removeChild(monsterEle);
					}
					
					monsterMoveTimer[mousterNum] = null;
				}else{
					monsterEle.innerHTML = monsterEle.innerHTML-1;
					var bulletNum =  bullets[i].getAttribute("index");
					
					bulletShutTimer[bulletNum] = null;					
				}
				bullets[i].parentNode.removeChild(bullets[i]);

			}
		}
	}
}
//往数组中插入元素
function insertArr(arr,index,item){
	for(var i=arr.length;i>index;i--){
		arr[i]=arr[i-1];
	}
	arr[i]=item;
}
