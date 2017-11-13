import React, {Component} from 'react';
import {Route, withRouter} from 'react-router-dom';

import * as API from '../api/API';
import LoginPage from "./pages/LoginPage";
import Message from "./Message";
import HomePage from "./pages/HomePage";
import '../App.css';


class Layout extends Component {

    constructor() {
        super();
        this.state = {
            isLoggedIn: false,
            message: '',
            username: '',
            images: []
        };
    }


    handleSubmit = (userdata) => {
        console.log('userdata before do:', userdata.username);

        API.doLogin(userdata)
            .then((data) => {
                if (data.status === 401) {
                    console.log('inside 401');

                    this.setState({
                        isLoggedIn: false,
                        message: "Login failed, please sign in again"
                    });
                    this.props.history.push("/");
                } else {
                    if (data.status === 201) {
                        this.setState({
                            isLoggedIn: true,
                            message: "Welcome to my App..!!",
                            username: data.username,
                            //  images: res
                        });
                        console.log('current User after handle submit processd:', userdata.username);
                        console.log('Data after Do login: ');
                        this.props.history.push("/homepage");
                    }
                }
            });
    };

    handleCreateAccount = (userdata) => {
        API.doSignUp(userdata)
            .then((status) => {
                if (status === 201) {
                    this.setState({
                        isLoggedIn: false,
                        message: "Created your account, Now Sign In",
                    });
                    this.props.history.push("/login");
                } else if (status === 401) {
                    this.setState({
                        isLoggedIn: false,
                        message: "Something's wrong, Try again..!!"
                    });
                }
            });
    };

    handleLogout = () => {
        API.doLogout()
            .then((status) => {
                    if (status === 201) {
                        this.props.history.push("/");
                    }
                }
            );
    };

    render() {
        return (
            <div className="container-fluid">
                <Route exact path="/" render={() => (
                    <div>
                        <Message message={this.state.message}/>
                        <LoginPage handleCreateAccount={this.handleCreateAccount} handleSubmit={this.handleSubmit}/>
                    </div>
                )}/>
                <Route exact path="/login" render={() => (
                    <div>
                        <Message message={this.state.message}/>
                        <LoginPage handleCreateAccount={this.handleCreateAccount} handleSubmit={this.handleSubmit}
                        />

                    </div>
                )}/>
                <Route exact path="/homepage" render={() => (
                    <div>
                        <HomePage handleLogout={this.handleLogout} currentUser={this.state.username}/>
                    </div>

                )}/>
            </div>
        );
    }
}

export default withRouter(Layout);
