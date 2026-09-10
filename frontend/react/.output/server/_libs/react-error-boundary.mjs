import { a as __toESM } from "../_runtime.mjs";
import { r as require_react } from "./react+tanstack__react-query.mjs";
//#region node_modules/react-error-boundary/dist/react-error-boundary.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var h = (0, import_react.createContext)(null);
var c = {
	didCatch: !1,
	error: null
};
var m = class extends import_react.Component {
	constructor(e) {
		super(e), this.resetErrorBoundary = this.resetErrorBoundary.bind(this), this.state = c;
	}
	static getDerivedStateFromError(e) {
		return {
			didCatch: !0,
			error: e
		};
	}
	resetErrorBoundary(...e) {
		const { error: t } = this.state;
		t !== null && (this.props.onReset?.({
			args: e,
			reason: "imperative-api"
		}), this.setState(c));
	}
	componentDidCatch(e, t) {
		this.props.onError?.(e, t);
	}
	componentDidUpdate(e, t) {
		const { didCatch: o } = this.state, { resetKeys: s } = this.props;
		o && t.error !== null && C(e.resetKeys, s) && (this.props.onReset?.({
			next: s,
			prev: e.resetKeys,
			reason: "keys"
		}), this.setState(c));
	}
	render() {
		const { children: e, fallbackRender: t, FallbackComponent: o, fallback: s } = this.props, { didCatch: n, error: a } = this.state;
		let i = e;
		if (n) {
			const u = {
				error: a,
				resetErrorBoundary: this.resetErrorBoundary
			};
			if (typeof t == "function") i = t(u);
			else if (o) i = (0, import_react.createElement)(o, u);
			else if (s !== void 0) i = s;
			else throw a;
		}
		return (0, import_react.createElement)(h.Provider, { value: {
			didCatch: n,
			error: a,
			resetErrorBoundary: this.resetErrorBoundary
		} }, i);
	}
};
function C(r = [], e = []) {
	return r.length !== e.length || r.some((t, o) => !Object.is(t, e[o]));
}
//#endregion
export { m as t };
