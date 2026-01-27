import React from 'react'

export default function Landing({onSignUp, onSignIn}){
  return (
    <div className="landing-root">
      <div className="landing-card">
        <div className="landing-hero">
          <div className="landing-logo">💰</div>
          <h1>SpendWise</h1>
          <p className="landing-lead">AI-Driven Personal Finance Advisor that helps you track expenses, manage income, and get intelligent insights for better financial decisions.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Smart Analytics</h4>
            <p>Get AI-powered insights into your spending patterns and financial habits with detailed analytics.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>Secure & Private</h4>
            <p>Your financial data is protected with bank-level security and encryption.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h4>Personalized Tips</h4>
            <p>Receive customized budget recommendations and money-saving tips based on your data.</p>
          </div>
        </div>

        <div className="cta-row">
          <button className="btn-primary" onClick={() => onSignUp && onSignUp()}>Get Started Free</button>
          <button className="btn-ghost" onClick={() => onSignIn && onSignIn()}>Sign In</button>
        </div>
      </div>
    </div>
  )
}
