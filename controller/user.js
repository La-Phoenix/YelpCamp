const User = require('../models/user');
const express = require('express');
const app = express();


    



module.exports.renderRegister = (req, res) => {
    res.render('user/register');
}
    
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email , username});
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
    
}
    
module.exports.renderLogin = (req, res) => {
    res.render('user/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // console.log(req.session)
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}
    
module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}
    
