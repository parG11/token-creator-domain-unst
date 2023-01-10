import UAuth from '@uauth/js';
import {ethers} from 'ethers';
import {ABI, bytecode} from './ContractDetails';
import './TokenCreator.css';
import {useState} from "react";

const uauth = new UAuth({
    clientID: '515a653d-0aba-43b3-96f2-978ac1d2c14c',
    redirectUri: 'http://localhost:3000'
})

export const TokenCreatorApp = () => {
    const [user, setUser] = useState(null);
    const [msg, setMsg] = useState('');
    const [tokenName, setTokenName] = useState(null);
    const [tokenSymbol, setTokenSymbol] = useState(null);
    const [tokenSupply, setTokenSupply] = useState(null);


    const login = async () => {
        setMsg(null)
        try {
            await uauth.loginWithPopup()
            uauth.user()
                .then(user => {
                    setUser(user)
                })
        } catch (error) {
            console.error(error)
        }
    }

    const createToken = async () => {
        if (!user) {
            setMsg('Login first please');
            return;
        }
        if (!tokenName || !tokenSymbol || !tokenSupply) {
            setMsg('Complete all fields');
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const chainId = (await provider.getNetwork()).chainId
        if (chainId !== 80001) {
            setMsg('Please connect to Mumbai Testnet');
            return;
        }
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setMsg("Transaction pending. Wait a few minutes please ...")
        const TokenCreator = new ethers.ContractFactory(ABI, bytecode, signer);
        const tokenCreator = await TokenCreator.deploy(tokenName, tokenSymbol, tokenSupply);
        tokenCreator.deployed().then(() =>
            setMsg("Success : Token deployed to " + tokenCreator.address)
        );
    }

    return (
        <div className="container">
            <nav className="navbar navbar-light mb-5 shadow">
                <div className="container-fluid">
                    <a id="page-title" className="navbar-brand fs-1" href="/">Token Creator</a>
                    {
                        !user
                            ? <div id="btn-login" onClick={login} style={{cursor: 'pointer'}}>
                                <img src="unstop-button.png"/>
                            </div>
                            : <div id="logged-user" className="bg-success text-light px-3 py-2">
                                {user?.sub}
                            </div>
                    }
                </div>
            </nav>

            <div className="p-4 mb-5 bg-light border">

                <form className="m-0">
                    <p className="lead">Create and deploy your own ERC-20 token.</p>

                    <div className="mb-3">
                        <label htmlFor="token-name" className="form-label">Token name</label>
                        <input type="text" onChange={(e) => setTokenName(e.target.value)} className="form-control"
                               aria-describedby="nameInfo"/>
                        <div id="nameInfo" className="form-text"></div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="token-symbol" className="form-label">Token symbol</label>
                        <input type="text" onChange={(e) => setTokenSymbol(e.target.value)} className="form-control"/>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="token-supply" className="form-label">Initial supply</label>
                        <input type="text" onChange={(e) => setTokenSupply(parseInt(e.target.value))}
                               className="form-control"/>
                    </div>

                    <button type="button" onClick={createToken} className="btn btn-primary me-2">Create</button>
                    <br/><br/>
                    <div id="message">{msg}</div>
                </form>

            </div>
        </div>
    );
}

export default TokenCreatorApp;
