import './herosection.css';
import heroImage from '../assets/hero.png';

function HeroSection() {
    return (
        <div className="hero-container">
            <div className="hero-section">
                <img className="hero-img" src={heroImage} alt="hero" />
            </div>
            <div className="hero-title">
                Flights
            </div>
        </div>
    )
}

export default HeroSection;