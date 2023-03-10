import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import {connect} from "react-redux";
import {login} from '../../Store/Slices/authSlice';
import {isEmail} from "validator";
import "./Forms.css";

class LoginForm extends Component {
    constructor() {
        super()
        this.state = {
            email:'',
            validEmail: false,
            password:''
        }
        this.changeEmail = this.changeEmail.bind(this)
        this.changePassword = this.changePassword.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    changeEmail(event){
        const email = event.target.value;
        this.setState({
            email,
            validEmail: isEmail(email),
        })
    }

    changePassword(event){
        this.setState({
            password:event.target.value
        })
    }

    onSubmit(event){
        event.preventDefault()
        if (!this.state.validEmail){
            alert("Invalid email!");
            return;
        }

        axios.post('http://54.69.36.110/login', {email: this.state.email, password: this.state.password})
        .then((response) => {
            if (response.data.success === true){
                this.props.login(response.data.username, response.data.email);
                window.location = '/profile';
            }
            else{
                alert("Your E-mail or password is incorrect")
            }
        })
    }


    render() { 
        return (
            <div>
                <div className='container'>
                    <div className='form-div'>
                        <form onSubmit={this.onSubmit}>
                            <input type='text'
                            placeholder='E-mail'
                            onChange={this.changeEmail}
                            value={this.state.email}
                            className='form-control form-group'
                            />
                            <p className="badField">{!this.state.validEmail ? "Must be valid email" : " "}</p>

                            <input type='password'
                            placeholder='Password'
                            onChange={this.changePassword}
                            value={this.state.password}
                            className='form-control form-group'
                            />

                            <input type='submit' className='btn btn-danger btn-block' value='Submit'/>
                        </form>
                        <Link className="forget-pass" to="/signup">Create an Account</Link>
                    </div>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        login: (username, email) => {
            dispatch(login({username, email}))
        }
    }
}
const mapStateToProps = state => {
    return {
        user: state.auth.user,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);