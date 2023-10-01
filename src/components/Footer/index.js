import { useLanguage } from '../../LanguageContext';
import { englishContent, spanishContent } from './content';
import { Link } from 'react-router-dom';
import logo from '../../assets/icons/healthy-brain.png';
// import map_pin from '../../assets/icons/map-pin.svg';
// import phone from '../../assets/icons/phone-icon.svg';
// import email from '../../assets/icons/mail-icon.svg';
// import facebook from '../../assets/icons/facebook-logo.svg';
import './Footer.css';


{/* <li>
                <button className='nav-button' onClick={() => scrollToSection('services')}>
                    {content.services}
                </button>
            </li> */}
export default function Footer() {
    const { currentLanguage, setCurrentLanguage } = useLanguage();
    const content = currentLanguage === 'english' ? englishContent : spanishContent;

    const scrollToSection = (sectionId) => {
        const sectionElement = document.getElementById(sectionId);
        sectionElement.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className='footer-container' id='footer' >
            <div className='footer-section'>
                <section className='logo-section'>
                    <Link to='/'>
                        <img src={logo} className='big-logo' alt="Big Sin Fronteras Logo" onClick={() => scrollToTop()} />
                    </Link>
                </section>

                <section className='second-footer-section'>
                    <ul className='footer-options-container'>
                        <li className='footer-heading'>
                            Clarity Companions
                        </li>
                        <div className='footer-options'>
                            <li>
                                <a href="https://www.isaiahxs.com/" target='_blank' rel='noopener noreferrer'>
                                    <div className='footer-icon-container'>
                                        {/* <img className='footer-icon GB-map-icon' alt='Map Pin Icon' /> */}
                                        <p className='footer-icon-description'>
                                            Portfolio
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href='https://www.linkedin.com/in/isaiahxs/' target='_blank' rel='noopener noreferrer'>
                                    <div className='footer-icon-container'>
                                        {/* <img className='footer-icon' alt='Phone Icon' /> */}
                                        <p className='footer-icon-description'>
                                            LinkedIn
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href='https://github.com/isaiahxs' target='_blank' rel='noopener noreferrer'>
                                    <div className='footer-icon-container'>
                                        {/* <img className='footer-icon' alt='Phone Icon' /> */}
                                        <p className='footer-icon-description'>
                                            GitHub
                                        </p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href='https://wellfound.com/u/isaiahxs' target='_blank' rel='noopener noreferrer'>
                                    <div className='footer-icon-container'>
                                        {/* <img className='footer-icon' alt='Phone Icon' /> */}
                                        <p className='footer-icon-description'>
                                            Wellfound
                                        </p>
                                    </div>
                                </a>
                            </li>
                        </div>
                    </ul>
                </section>

                {/* <section className='third-footer-section'>
                    <ul className='footer-options-container'>
                        <li className='footer-heading'>
                            Socials
                        </li>

                        <div className='footer-options'>
                            <li>
                                <a href="https://www.facebook.com/sinfronterascafe/?ref=page_internal" target='_blank' rel='noopener noreferrer'>
                                    <div className='footer-icon-container'>
                                        <img className='footer-icon' alt='Facebook Logo' />
                                        <p className='footer-icon-description'>Facebook</p>
                                    </div>
                                </a>
                            </li>
                        </div>
                    </ul>
                </section> */}

            </div >
            <div className='credits-container'>
                <p className='credits-created-by'>Created by:</p>
                <a href='https://www.isaiahxs.com/' target='_blank' rel='noopener noreferrer' className='isaiah'>
                    Isaiah Sinnathamby
                </a>
            </div>
        </footer >
    )
}
