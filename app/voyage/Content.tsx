import useSetSearchParams from '@/components/useSetSearchParams'
import { getCategory } from '@/components/voyage/categories'
import { getThumb } from '@/components/wikidata'
import { useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import BikeRouteRésumé from './BikeRouteRésumé'
import { ExplanationWrapper } from './ContentUI'
import Explanations from './explanations.mdx'
import { FeatureImage } from './FeatureImage'
import GareInfo from './GareInfo'
import { defaultState } from './Map'
import OsmFeature from './OsmFeature'
import PlaceSearch from './PlaceSearch'
import QuickFeatureSearch from './QuickFeatureSearch'
import StyleChooser from './styles/StyleChooser'
import { DialogButton, ModalCloseButton } from './UI'
import useOgImageFetcher from './useOgImageFetcher'
import useWikidata from './useWikidata'
import { ZoneImages } from './ZoneImages'

const getMinimumQuickSearchZoom = (mobile) => (mobile ? 10.5 : 12) // On a small screen, 70 %  of the tiles are not visible, hence this rule

export default function Content({
	latLngClicked,
	setLatLngClicked,
	clickedGare,
	bikeRoute,
	setBikeRouteProfile,
	bikeRouteProfile,
	clickGare,
	osmFeature,
	setOsmFeature,
	zoneImages,
	resetZoneImages,
	state,
	setState,
	zoom,
	sideSheet, // This gives us the indication that we're on the desktop version, where the Content is on the left, always visible, as opposed to the mobile version where a pull-up modal is used
	searchParams,
	setSnap = (snap) => null,
	openSheet = () => null,
	setStyleChooser,
	style,
	styleChooser,
	itinerary,
}) {
	const url = osmFeature?.tags?.website || osmFeature?.tags?.['contact:website']
	const ogImages = useOgImageFetcher(url),
		ogImage = ogImages[url]

	const [tutorials, setTutorials] = useLocalStorage('tutorials', {})
	const introductionRead = tutorials.introduction,
		clickTipRead = tutorials.clickTip
	const wikidata = useWikidata(osmFeature, state)

	console.log('wikidata received', wikidata)
	const setSearchParams = useSetSearchParams()
	useEffect(() => {
		if (!introductionRead) setSnap(1)
	}, [introductionRead, setSnap])

	const choice = state.vers?.choice
	const category = getCategory(searchParams)

	const wikidataPictureUrl = wikidata?.pictureUrl
	const wikiFeatureImage =
		osmFeature &&
		(osmFeature.tags?.wikimedia_commons
			? getThumb(osmFeature.tags.wikimedia_commons, 500)
			: wikidataPictureUrl)

	const hasContent = choice || osmFeature || zoneImages || !clickTipRead
	const hasFeature = choice || osmFeature
	const showSearch = sideSheet || !hasFeature

	const minimumQuickSearchZoom = getMinimumQuickSearchZoom(!sideSheet)

	useEffect(() => {
		if (!showSearch) return
		if (zoom > minimumQuickSearchZoom) {
			setSnap(2)
		}
	}, [showSearch, zoom])

	if (!introductionRead)
		return (
			<ExplanationWrapper>
				<Explanations />
				<DialogButton
					onClick={() => setTutorials({ ...tutorials, introduction: true })}
				>
					OK
				</DialogButton>
			</ExplanationWrapper>
		)

	return (
		<section>
			{showSearch && (
				<section>
					{!choice && (
						<PlaceSearch
							{...{
								state,
								setState,
								sideSheet,
								setSnap,
								zoom,
								setSearchParams,
								searchParams,
							}}
						/>
					)}
					{/* TODO reuse the name overlay and only that ?
					wikidataPictureUrl && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{}}
							key={wikidataPictureUrl}
							exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
						>
							<ImageWithNameWrapper>
								<CityImage
									src={wikidataPictureUrl}
									alt={`Une photo emblématique de la destination, ${state.vers.choice?.item?.nom}`}
								/>
								<Destination>
									<NextImage src={destinationPoint} alt="Vers" />
									<h2>{osmFeature.tags.name}</h2>
								</Destination>
							</ImageWithNameWrapper>
						</motion.div>
					)
					*/}
					{zoom > minimumQuickSearchZoom && (
						<QuickFeatureSearch
							{...{
								category,
								searchParams,
								searchInput: state.vers.inputValue,
								setSnap,
							}}
						/>
					)}
				</section>
			)}

			{itinerary.route && (
				<BikeRouteRésumé
					{...{
						data: itinerary.route,
						bikeRouteProfile,
						setBikeRouteProfile,
					}}
				/>
			)}

			{styleChooser ? (
				<StyleChooser {...{ setStyleChooser, style }} />
			) : (
				hasContent && (
					<section
						css={`
							padding-top: 1.6rem;
							position: relative;
						`}
					>
						{(choice || osmFeature) && (
							<ModalCloseButton
								title="Fermer l'encart point d'intéret"
								onClick={() => {
									console.log('will yo')
									setSearchParams({ lieu: undefined })
									setTimeout(() => setOsmFeature(null), 100)
									setLatLngClicked(null)
									resetZoneImages()
									console.log('will set default stat')
									setState(defaultState)
									openSheet(false)
								}}
							/>
						)}
						{ogImage && (
							<FeatureImage
								src={ogImage}
								css={`
									width: 100%;
									height: 6rem;
									@media (min-height: 800px) {
										height: 9rem;
									}
									object-fit: cover;
								`}
							/>
						)}
						{wikiFeatureImage && (
							<FeatureImage
								src={wikiFeatureImage}
								css={`
									width: 100%;
									height: 6rem;
									@media (min-height: 800px) {
										height: 9rem;
									}
									object-fit: cover;
								`}
							/>
						)}
						<ZoneImages images={zoneImages} />
						{clickedGare ? (
							<div>
								<ModalCloseButton
									title="Fermer l'encart gare"
									onClick={() => {
										console.log('will yo2')
										clickGare(null)
									}}
								/>
								{bikeRoute && (
									<BikeRouteRésumé
										{...{
											data: bikeRoute,
											bikeRouteProfile,
											setBikeRouteProfile,
										}}
									/>
								)}
								<GareInfo clickedGare={clickedGare} />
							</div>
						) : osmFeature ? (
							<OsmFeature data={osmFeature} />
						) : (
							!clickTipRead && (
								<div>
									<p
										css={`
											max-width: 20rem;
										`}
									>
										Cliquez sur un point d'intérêt ou saisissez une destination
										puis explorez les gares autour.
									</p>
									<DialogButton
										onClick={() =>
											setTutorials({ ...tutorials, clickTip: true })
										}
									>
										OK
									</DialogButton>
								</div>
							)
						)}
					</section>
				)
			)}
		</section>
	)
}
