<nav>
    <header>
      <h1>Dune II</h1>
      <h2>Battle for Arrakis</h2>
    </header>
    <ul>
      <li><a href="#/game">New Game</a></li>
      <li><a href="#/settings">Settings</a></li>
</nav>

<style>
    nav {
        font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
        position: absolute;
        top: 50%;
        left: 50%;
        text-align: center;
        transform: translate(-50%, -50%);
    }

    nav > header {
        border-bottom: 1px solid sandybrown;
        padding-bottom: .5rem;
        margin-bottom: .5rem;
    }

    nav > header > h1 {
        color: #e62616;
        font-size: 6rem;
        margin: 0;
        text-transform: uppercase;
    }

    nav > header > h2 {
        font-size: 2rem;
        font-weight: 100;
        letter-spacing: .625rem;
        margin: 0;
    }

    nav > ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    nav > ul > li {
        border: 1px solid transparent;
        display: block;
    }

    nav > ul > li > a {
        color: white;
        font-weight: 100;
        text-decoration: none;
        text-transform: capitalize;
    }

    nav > ul > li > a:hover {
        color: #e62616;
    }
</style>
