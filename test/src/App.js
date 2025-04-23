
import logo from './logo.svg';
import './App.css';
import { useMediaQuery, MediaQuery } from 'react-responsive';



function App() {
  return (
    <div className="App"> 
      <div className="Background">
        <MediaQuery minWidth={768}>
         <p>AI그림</p>
         <p>동물타투</p>
        </MediaQuery>
        <MediaQuery maxWidth={767}>
         <p>This is a small screen.</p>
        </MediaQuery>

      </div>
      <div className="Background_u">
          <img className="Background_u" alt="cute_animal" src="img/cute_animal1.webp"/>
          <img className="Background_u" alt="cute_animal" src="img/cute_animal2.webp"/>
      </div>
      <div className="Background_u">
      </div>

    </div>
  );
}

function MyComponent() {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  return (
    <div>
      {isSmallScreen ? (
        <p>This is a small screen.</p>
      ) : (
        <p>This is a large screen.</p>
      )}
    </div>
  );
}
export default App;
