class UserSome{
    //Add serverUrl and appId from your Moralis server
    //In production put the code your serverUrl and credentials in Cloud method (dtored on your Moralis server)
    serverUrl = "";
    appId = ""; 
    //Supported chains
    static chains = {
        eth: {id:'0x1', link:'https://etherscan.io/tx/', linkTokenAddress: 'https://etherscan.io/address/'},
        bsc: {id:'0x38', link:'https://bscscan.com/tx/', linkTokenAddress: 'https://bscscan.com/address/'},
        avalanche: {id:'0xa86a', link:'https://snowtrace.io/tx/', linkTokenAddress: 'https://snowtrace.io/address/'},
        fantom: {id:'0xfa', link:'https://ftmscan.com/tx/', linkTokenAddress: 'https://ftmscan.com/address/'},
        polygon: {id:'0x89', link:'https://polygonscan.com/tx/', linkTokenAddress: 'https://polygonscan.com/address/'}
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
            let authMsg = UserSome.allertMsg();
            document.getElementById("btn-login").hidden = true;
            document.getElementById("btn-logout").hidden = false;
            document.getElementById("btn-get-stats").hidden = false;
            document.getElementById("btn-get-tokens").hidden = false;   
            document.getElementById("btn-get-nft-tokens").hidden = false;              
            const container = document.getElementById('get-stats');
            if(res){
                res = UserSome.capitalizeFirstLetter(res);
                authMsg.innerHTML = `You're on <b>${res}</b> network.`;
                container.appendChild(authMsg);                
            }else{
                authMsg.innerHTML = `The chain is not supported!`;
                container.appendChild(authMsg);
            }
        }else document.getElementById('get-stats').innerHTML = "";
    }     
    async logOut() {
        await Moralis.User.logOut();
        document.getElementById("btn-login").hidden = false;
        document.getElementById("btn-logout").hidden = true;
        document.getElementById("btn-get-stats").hidden = true;
        document.getElementById("btn-get-tokens").hidden = true; 
        document.getElementById("btn-get-nft-tokens").hidden = true; 
        document.getElementById('get-stats').innerHTML = "";
        let authMsg = UserSome.allertMsg();
        const container = document.getElementById('get-stats');
        container.appendChild(authMsg);
        authMsg.textContent = "You're logged out!";
        setTimeout(UserSome.destroyTag, 3000);
    }   
    async getStats() {
        let user = Moralis.User.current();
        //Checking if the user is logged in
        if (user) { 
            let res = await UserSome.findChain().then(response => {return response});
            const container = document.getElementById('get-stats'); 
            container.innerHTML = "";
            const messageChain = document. createElement('p');
            //Checking if chain is supported
            if(res){
                let allTransactions = await UserSome.getAllTranscations(res).then(response => {return response});
                let resFirstUpperCase = UserSome.capitalizeFirstLetter(res);
                messageChain.innerHTML = `<p>Your transactions on <b>${resFirstUpperCase}</b> chain (sorted by date) are:</p>`;
                container.appendChild(messageChain);
                let i = 1;
                allTransactions.result.forEach(element => {
                    let alertMsg = document.createElement('div');
                    alertMsg.setAttribute("class" , "alert alert-info");
                    alertMsg.setAttribute("role" , "alert");
                    const transaction_hash = document. createElement('a');
                    const etherscan_link = UserSome.chains[`${res}`]['link']+element.hash;
                    transaction_hash.setAttribute('href', etherscan_link);
                    transaction_hash.setAttribute('target','_blank');
                    let date = new Date(element.block_timestamp);
                    date = date.toLocaleString();
                    transaction_hash.textContent = 'link';
                    let order = document.createElement('span');
                    order.textContent = i+'. -- '+date+' ';
                    i++;
                    alertMsg.appendChild(order);
                    alertMsg.appendChild(transaction_hash);
                    container.appendChild(alertMsg);
                });
            }else{
                messageChain.innerHTML = `The chain is not supported!`;
                container.appendChild(messageChain);
            }    
        }else await Moralis.User.authenticate({signingMessage:"Please sign up to Simple Moralis Dapp"});
    }
    async getTokenBalance() {
        let user = Moralis.User.current();
        //Checking if the user is logged in
        if (user) { 
            let res = await UserSome.findChain().then(response => {return response});
            const container = document.getElementById('get-stats'); 
            container.innerHTML = "";
            const messageChain = document. createElement('p');
            //Checking if chain is supported
            if(res){
                let allTokens = await UserSome.userTokenBalances(res).then(response => {return response});
                let resFirstUpperCase = UserSome.capitalizeFirstLetter(res);
                messageChain.innerHTML = `<p>Your token balances on <b>${resFirstUpperCase}</b> chain (sorted by date) are:</p>`;
                container.appendChild(messageChain);
                let i = 1;
                let tokenTable = document.createElement('table');
                tokenTable.setAttribute("class", "table table-striped");
                container.appendChild(tokenTable);
                tokenTable.innerHTML = `
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Symbol</th>
                    <th scope="col">Balance in Native Token</th>
                    <th scope="col">Token Address</th>
                    </tr>
                </thead>`; 
                let tokenTbody = document.createElement('tbody');
                tokenTable.appendChild(tokenTbody);

                allTokens.forEach(element => {
                    let tokenTr = document.createElement('tr');
                    tokenTbody.appendChild(tokenTr);
                    let tokenTh = document.createElement('th');
                    tokenTh.setAttribute("scope", "row");
                    tokenTh.textContent = i;
                    i++;
                    tokenTr.appendChild(tokenTh);
                    let tokenTd = document.createElement('td');
                    tokenTd.textContent = element.name;
                    tokenTr.appendChild(tokenTd);
                    let tokenTd2 = document.createElement('td');
                    tokenTd2.textContent = element.symbol;
                    tokenTr.appendChild(tokenTd2);
                    let tokenTd3 = document.createElement('td');
                    //Convert token value to ETH style with 18 decimals
                    //If you do not specify decimals, 18 decimals will be automatically used
                    let tokenValue = Moralis.Units.FromWei(element.balance, element.decimals)
                    tokenTd3.textContent = tokenValue;
                    tokenTr.appendChild(tokenTd3);
                    let tokenTd4 = document.createElement('td');
                    
                    let tokenAddress = document. createElement('a');
                    let token_link = UserSome.chains[`${res}`]['linkTokenAddress']+element.token_address;
                    tokenAddress.setAttribute('href', token_link);
                    tokenAddress.setAttribute('target','_blank');
                    tokenAddress.textContent = 'click here';
                    tokenTd4.appendChild(tokenAddress);
                    tokenTr.appendChild(tokenTd4);
                });
            }else{
                messageChain.innerHTML = `The chain is not supported!`;
                container.appendChild(messageChain);
            }    
        }else await Moralis.User.authenticate({signingMessage:"Please sign up to Simple Moralis Dapp"});
    }
    async getNftBalance() {
        let user = Moralis.User.current();
        //Checking if the user is logged in
        if (user) { 
            let res = await UserSome.findChain().then(response => {return response});
            const container = document.getElementById('get-stats'); 
            container.innerHTML = "";
            const messageChain = document. createElement('p');
            //Checking if chain is supported
            if(res){
                let allTokens = await UserSome.userNftBalances(res).then(response => {return response});
                let resFirstUpperCase = UserSome.capitalizeFirstLetter(res);
                messageChain.innerHTML = `<p>Your Nft balances on <b>${resFirstUpperCase}</b> chain (sorted by date) are:</p>`;
                container.appendChild(messageChain);
                let i = 1;
                let tokenTable = document.createElement('table');
                tokenTable.setAttribute("class", "table table-striped");
                container.appendChild(tokenTable);
                tokenTable.innerHTML = `
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Symbol</th>
                    <th scope="col">Nft Address</th>
                    </tr>
                </thead>`; 
                let tokenTbody = document.createElement('tbody');
                tokenTable.appendChild(tokenTbody);

                allTokens.result.forEach(element => {
                    let tokenTr = document.createElement('tr');
                    tokenTbody.appendChild(tokenTr);
                    let tokenTh = document.createElement('th');
                    tokenTh.setAttribute("scope", "row");
                    tokenTh.textContent = i;
                    i++;
                    tokenTr.appendChild(tokenTh);
                    let tokenTd = document.createElement('td');
                    tokenTd.textContent = element.name;
                    tokenTr.appendChild(tokenTd);
                    let tokenTd2 = document.createElement('td');
                    tokenTd2.textContent = element.symbol;
                    tokenTr.appendChild(tokenTd2);
                    let tokenTd3 = document.createElement('td');                   
                    let tokenAddress = document. createElement('a');
                    let token_link = UserSome.chains[`${res}`]['linkTokenAddress']+element.token_address;
                    tokenAddress.setAttribute('href', token_link);
                    tokenAddress.setAttribute('target','_blank');
                    tokenAddress.textContent = 'click here';
                    tokenTd3.appendChild(tokenAddress);
                    tokenTr.appendChild(tokenTd3);
                });
            }else{
                messageChain.innerHTML = `The chain is not supported!`;
                container.appendChild(messageChain);
            }    
        }else await Moralis.User.authenticate({signingMessage:"Please sign up to Simple Moralis Dapp"});
    }
    //Method for checking the users chain
    static async findChain(){
        let userChain = await Moralis.chainId;
        for (const key in UserSome.chains) {
            if(UserSome.chains[key]['id'] == userChain)
            return key;           
        }
    }
    static async getAllTranscations(res){
        let allTransactions;
        if(res == "eth"){
            allTransactions = await Moralis.Web3API.account.getTransactions();
            return allTransactions;
        }else{
            const options = {
                chain: `${res}`
            };
            allTransactions = await Moralis.Web3API.account.getTransactions(options);
            return allTransactions;
        }
    }
    static async userTokenBalances(res){
        let allTokens;
        if(res == "eth"){
            allTokens = await Moralis.Web3API.account.getTokenBalances();
            return allTokens;
        }else{
            const options = {
                chain: `${res}`
            };
            allTokens = await Moralis.Web3API.account.getTokenBalances(options);
            return allTokens;
        }
    }
    static async userNftBalances(res){
        let allTokens;
        if(res == "eth"){
            allTokens = await Moralis.Web3API.account.getNFTs();
            return allTokens;
        }else{
            const options = {
                chain: `${res}`
            };
            allTokens = await Moralis.Web3API.account.getNFTs(options);
            return allTokens;
        }
    }
    static capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    static allertMsg(){
            let authMsg = document.createElement('div');
            authMsg.setAttribute("id" , "msg");
            authMsg.setAttribute("class" , "alert alert-primary");
            authMsg.setAttribute("role" , "alert");
            return authMsg;
    }
    static destroyTag(){
        let tag = document.getElementById("msg");
        tag.remove();
    }
}