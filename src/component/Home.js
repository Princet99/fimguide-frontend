import React from "react";
import "./style/style.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <header className="header">
        <h1>Welcome to FIM Guide</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="intro">
          <h2>Introduction</h2>
          <p>
            Welcome to the FIM Guide, your comprehensive resource for financial
            information management.
          </p>
        </section>
        <section className="features">
          <h2>Features</h2>
          <ul>
            <li>Feature 1: Detailed financial analysis</li>
            <li>Feature 2: Real-time data updates</li>
            <li>Feature 3: Customizable reports</li>
            <li>Feature 4: Secure data storage</li>
          </ul>
        </section>
        <section className="testimonials">
          <h2>Testimonials</h2>
          <div className="testimonial">
            <p>
              "FIM Guide has revolutionized the way we manage our financial
              data."
            </p>
            <p>- John Doe, CEO of Financial Corp</p>
          </div>
          <div className="testimonial">
            <p>
              "The real-time updates and customizable reports are
              game-changers."
            </p>
            <p>- Jane Smith, CFO of Investment Inc.</p>
          </div>
        </section>
        <section className="news">
          <h2>Latest News</h2>
          <article>
            <h3>News Title 1</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              nec odio. Praesent libero. Sed cursus ante dapibus diam.
            </p>
          </article>
          <article>
            <h3>News Title 2</h3>
            <p>
              Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis
              sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper
              porta.
            </p>
          </article>
          <article>
            <h3>News Title 3</h3>
            <p>
              Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent
              taciti sociosqu ad litora torquent per conubia nostra, per
              inceptos himenaeos.
            </p>
          </article>
        </section>
        <section className="contact">
          <h2>Contact Us</h2>
          <form>
            <label>
              Name:
              <input type="text" name="name" />
            </label>
            <label>
              Email:
              <input type="email" name="email" />
            </label>
            <label>
              Message:
              <textarea name="message"></textarea>
            </label>
            <button type="submit">Submit</button>
          </form>
        </section>
      </main>
      <footer>
        <p>&copy; 2023 FIM Guide. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
