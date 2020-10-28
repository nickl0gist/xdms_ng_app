import { UrlSegment, UrlSegmentGroup, Route } from '@angular/router';

export function CustomUrlMatcher(paramName: string, regex: RegExp) {
  return (
    segmenties: UrlSegment[],
    segmentyGroup: UrlSegmentGroup,
    route: Route) => {
    const posParams: { [key: string]: UrlSegment } = {};
    const kawalki = [regex];
    const consumed: UrlSegment[] = [];
    let biezancyIndex = 0;
    for (let i = 0; i < kawalki.length; ++i) {
      if (biezancyIndex >= segmenties.length) {
        return null;
      }
      const current = segmenties[biezancyIndex];
      const part = kawalki[i];
      if (!part.test(current.path)) {
        return null;
      }
      posParams[paramName] = current;
      consumed.push(current);
      biezancyIndex++;
    }
    if (route.pathMatch === 'full' &&
      (segmentyGroup.hasChildren() || biezancyIndex < segmenties.length)) {
      return null;
    }
    return { consumed, posParams };
  }
}
