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

    canGo(boardInfo,turnCounter,simple=true,enemyCanGoList=null,pawnPredict=false){
        let ret = [];
        if(this.name == 'Pawn'){
            // 첫 이동은 2칸 이동 가능, 단 다른 유닛을 건너띄는 이동은 불가능
            if(!pawnPredict && this.movedtime == 0){
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
            if(!pawnPredict){
                for(let j=0;j<2;++j){
                    if(this.isVal(this.y,this.x+dx[j]) && boardInfo[this.y][this.x+dx[j]].team != this.team && boardInfo[this.y][this.x+dx[j]].name=='Pawn'){
                        if(boardInfo[this.y][this.x+dx[j]].lastmovedTurn == turnCounter-1 &&
                            ((this.y == 3 && !this.team) || (this.y == 4 && this.team))) ret.push({y:this.y + (this.team? 1:-1),x:this.x+dx[j], catch : {y:this.y,x:this.x+dx[j]}});
                    }
                }
            }
            let dy = -1;
            if(this.team) dy = -dy;
            if(this.isVal(this.y+dy,this.x) && boardInfo[this.y+dy][this.x].empty && !pawnPredict) ret.push({y:this.y + dy, x : this.x,catch: false});
            
            // 대각선으로 이동, 단 '적' 유닛이 있어야함
            for(let j=0;j<2;++j){
                let ny = this.y + (this.team? 1 : -1);
                if(this.isVal(ny,this.x+dx[j]) && boardInfo[ny][this.x+dx[j]].team != this.team && !boardInfo[ny][this.x+dx[j]].empty){
                    ret.push({y:ny,x:this.x+dx[j],catch:{y:ny, x: this.x+dx[j]}});
                }else if(this.isVal(ny,this.x+dx[j]) && pawnPredict){
                    ret.push({y:ny,x:this.x+dx[j]});
                }
            }

            return ret;
        }
        else if(this.name =='King'){
            // 캐슬링 가능 여부 검사,
            // 1. 킹과 캐슬링을 할 룩 모두 한 칸도 움직이면 안된다. (가능)
            // 2. 킹과 캐슬링하는 룩 사이 다른 말이 있어서는 안된다. (가능)
            // 3. 현재 킹이 체크되어 있으면 안된다. (불가능)
            // 4. 킹이 캐슬링을 하면서 이동 할 경로에 적의 공격/이동이 가능해서는 안 된다. (불가능)
            // 5. 킹과 룩은 같은 열에 있어야 한다. (가능)
            if(simple){
                let dy = [-1,-1,0,1,1,1,0,-1];
                let dx = [0,1,1,1,0,-1,-1,-1];
                for(let d=0;d<dy.length;++d){
                    let ny = this.y + dy[d];
                    let nx = this.x + dx[d];
                    if(this.isVal(ny,nx)){
                        if(boardInfo[ny][nx].empty){
                            ret.push({y:ny,x:nx,catch:false});
                        }else if(boardInfo[ny][nx].team != this.team){
                            ret.push({y:ny,x:nx,catch:{y:ny,x:nx}});
                        }
                    }
                }
                return ret;
            }else{
                // 상대가 이동 할 수 있는 곳에는 갈 수 없다.
                let dy = [-1,-1,0,1,1,1,0,-1];
                let dx = [0,1,1,1,0,-1,-1,-1];
                for(let d=0;d<dy.length;++d){
                    let ny = this.y + dy[d];
                    let nx = this.x + dx[d];
                    if(this.isVal(ny,nx) && !enemyCanGoList[ny][nx]){
                        if(boardInfo[ny][nx].empty){
                            ret.push({y:ny,x:nx,catch:false});
                        }else if(boardInfo[ny][nx].team != this.team){
                            ret.push({y:ny,x:nx,catch:{y:ny,x:nx}});
                        }
                    }
                }
                return ret;
            }
        }

        let dy = [], dx = [];
        if(this.name == 'Queen'){
            dy = [-1,-1,0,1,1,1,0,-1];
            dx = [0,1,1,1,0,-1,-1,-1];
        }
        else if(this.name == 'Rook'){
            dy = [0,1,0,-1];
            dx = [1,0,-1,0];
        }
        else if(this.name == 'Bishop'){
            dy = [1,1,-1,-1];
            dx = [1,-1,1,-1];
        }
        else if(this.name == 'Knight'){
            dy = [-2,-2,-1,-1,1,1,2,2];
            dx = [1,-1,2,-2,2,-2,-1,1];
        }

        if(this.name != 'Knight'){
            for(let d=0;d<dy.length;++d){
                for(let i=1;;++i){
                    let ny = this.y + dy[d]*i;
                    let nx = this.x + dx[d]*i;
                    if(!this.isVal(ny,nx) || boardInfo[ny][nx].team == this.team) break;
                    else if(boardInfo[ny][nx].empty){
                        ret.push({y:ny,x:nx,catch:false});
                    }else{
                        ret.push({y:ny,x:nx,catch:{y:ny,x:nx}});
                        break;
                    }
                }
            }
        }else{
            for(let d=0;d<dy.length;++d){
                let ny = this.y + dy[d];
                let nx = this.x + dx[d];
                if(this.isVal(ny,nx)){
                    if(boardInfo[ny][nx].empty){
                        ret.push({y:ny,x:nx,catch:false});
                    }else if(boardInfo[ny][nx].team != this.team){
                        ret.push({y:ny,x:nx,catch:{y:ny,x:nx}});
                    }
                }
            }
        }
        return ret;
    }
};