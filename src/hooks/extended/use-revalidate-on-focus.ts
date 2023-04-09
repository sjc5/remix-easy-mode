import { useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'

// adapted from https://sergiodxa.com/articles/automatic-revalidation-in-remix
export const useRevalidateOnFocus = () => {
	let { revalidate } = useRevalidator()

	useEffect(
		function revalidateOnFocus() {
			function onFocus() {
				revalidate()
			}
			window.addEventListener('focus', onFocus)
			return () => window.removeEventListener('focus', onFocus)
		},
		[revalidate],
	)

	useEffect(
		function revalidateOnVisibilityChange() {
			function onVisibilityChange() {
				revalidate()
			}
			window.addEventListener('visibilitychange', onVisibilityChange)
			return () =>
				window.removeEventListener('visibilitychange', onVisibilityChange)
		},
		[revalidate],
	)
}
