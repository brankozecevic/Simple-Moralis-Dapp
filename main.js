class UserSome{
    //Add serverUrl and appId from your Moralis server
    //In production put the code your serverUrl and credentials in Cloud method (dtored on your Moralis server)
    serverUrl = "";
    appId = ""; 
    //Supported chains
    static chains = {
        eth: {id:'0x1', link:'https://etherscan.io/tx/'},
        bsc: {id:'0x38', link:'https://bscscan.com/tx/'},
        avalanche: {id:'0xa86a', link:'https://snowtrace.io/tx/'},
        fantom: {id:'0xfa', link:'https://ftmscan.com/tx/'},
        polygon: {id:'0x89', link:'https://polygonscan.com/tx/'}
    }
    //Initialize your server using Moralis.start()
    constructor(){
        let serverUrl = this.serverUrl;
        let appId = this.appId;
        Moralis.start({ serverUrl, appId });
    }
    async login() {
        let user = Moralis.User.current();
        if (!user) {
            user = await Moralis.authenticate({signingMessage:"Please sign up to Simple Moralis Dapp"});
            let res = await UserSome.findChain().then(response => {return response});
            document.getElementById("btn-login").hidden = true;
            document.getElementById("btn-logout").hidden = false;
            document.getElementById("btn-get-stats").hidden = false;
            res = UserSome.capitalizeFirstLetter(res);
            document.getElementById("msg").textContent = `You're on ${res} network.`;
        }
    }     
    async logOut() {
        await Moralis.User.logOut();
        document.getElementById("btn-login").hidden = false;
        document.getElementById("btn-logout").hidden = true;
        document.getElementById("btn-get-stats").hidden = true;
        document.getElementById('get-stats').innerHTML = "";
        document.getElementById("msg").textContent = "You're logged out";
    }   
    async getStats() {
        let user = Moralis.User.current();
        //Checking if the user is logged in
        if (user) { 
            let res = await UserSome.findChain().then(response => {return response});
            //Checking if chain is supported
            if(res){
                document.getElementById("msg").textContent = "";
                const container = document.getElementById('get-stats'); 
                container.innerHTML = "";
                const messageChain = document. createElement('p');
                container.appendChild(messageChain);
                let allTransactions;
                if(res == "eth"){
                    allTransactions = await Moralis.Web3API.account.getTransactions();
                }else{
                    const options = {
                        chain: `${res}`
                    };
                    allTransactions = await Moralis.Web3API.account.getTransactions(options);
                }
                messageChain.textContent = `Your transactions on ${res} chain are:`;
                allTransactions.result.forEach(element => {
                    const transaction_hash = document. createElement('a');
                    const break_line = document. createElement('p');
                    const etherscan_link = UserSome.chains[`${res}`]['link']+element.hash;
                    transaction_hash.setAttribute('href', etherscan_link);
                    transaction_hash.setAttribute('target','_blank');
                    transaction_hash.textContent = element.hash;
                    container.appendChild(transaction_hash);
                    container.appendChild(break_line); 
                });
            }else alert('This chain is not supported!');         
        }else Moralis.User.authenticate({signingMessage:"Please sign up to Simple Moralis Dapp"});
    }
    //Method for checking the users chain
    static async findChain(){
        let userChain = await Moralis.chainId;
        for (const key in UserSome.chains) {
            if(UserSome.chains[key]['id'] == userChain)
            return key;           
        }
    }
    static capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
