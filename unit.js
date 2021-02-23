class Unit{
    constructor(y,x,team,name,movedtime=0, alive=true,lastmovedTurn=-1){
        this.y = y;
        this.x = x;
        this.team = team;
        this.name = name;
        this.movedtime = movedtime;
        this.alive = alive;
        this.lastmovedTurn = lastmovedTurn;
    }

    isVal(y,x){
        if(y < 0 || y >= 8 || x < 0 || x >= 8) return false;
        return true;
    }

    canGo(boardInfo,turnCounter){
        let ret = [];
        if(this.name == 'Pawn'){
            // 첫 이동은 2칸 이동 가능, 단 다른 유닛을 건너띄는 이동은 불가능
            if(this.movedtime == 0){
                let ch = true;
                for(let i=1;i<=2;++i){
                    let dy = -i;
                    if(this.team) dy = -dy;
                    let ny = this.y + dy;
                    if(!this.isVal(ny,this.x) || !boardInfo[ny][this.x].empty) ch = false;
                }
                if(ch) ret.push({y:this.y + (this.team ? 2:-2),x:this.x,catch: false});
            }
            let dx = [-1,1];
            // 앙파상 ( 상대방의 마지막 수가 폰을 2칸 전진시킨거였고 그 폰이 나의 옆에 있을 때 대각선으로 움직이며 그 폰을 먹을 수 있다. )
            for(let j=0;j<2;++j){
                if(this.isVal(this.y,this.x+dx[j]) && boardInfo[this.y][this.x+dx[j]].team != this.team && boardInfo[this.y][this.x+dx[j]].name=='Pawn'){
                    if(boardInfo[this.y][this.x+dx[j]].lastmovedTurn == turnCounter-1 &&
                        (this.y == 3 && !this.team) || (this.y == 4 && this.team)) ret.push({y:this.y + (this.team? 1:-1),x:this.x+dx[j], catch : {y:this.y,x:this.x+dx[j]}});
                }
            }
            let dy = -1;
            if(this.team) dy = -dy;
            if(this.isVal(this.y+dy,this.x) && boardInfo[this.y+dy][this.x].empty) ret.push({y:this.y + dy, x : this.x,catch: false});
            
            // 대각선으로 이동, 단 '적' 유닛이 있어야함
            for(let j=0;j<2;++j){
                let ny = this.y + (this.team? 1 : -1);
                if(this.isVal(ny,this.x+dx[j]) && boardInfo[ny][this.x+dx[j]].team != this.team && !boardInfo[ny][this.x+dx[j]].empty){
                    ret.push({y:ny,x:this.x+dx[j],catch:{y:ny, x: this.x+dx[j]}});
                }
            }

            return ret;
        }
        else if(this.name ='King'){
            return ret;
        }

        let dy = [], dx = [];
        if(this.name == 'Queen'){
            for(let i=-8;i<=8;++i){
                dy.push()
            }
        }
        else if(this.name == 'Rook'){

        }
        else if(this.name == 'Bishop'){

        }
        else if(this.name == 'Knight'){

        }

        return ret;
    }
};