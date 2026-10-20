import PageHero from "../components/layout/PageHero";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <PageHero page="notFound" title="Off the" dim="marked trail" blurb="This page doesn't exist — let's get you back on route.">
      <Button to="/" variant="light">
        Back to home
      </Button>
    </PageHero>
  );
}
