import { Component } from "react";
import ServiceUnavailablePage from "@/pages/service-unavailable";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Erreur d’affichage du portail", error, info);
  }

  render() {
    if (this.state.failed) return <ServiceUnavailablePage embedded />;
    return this.props.children;
  }
}
