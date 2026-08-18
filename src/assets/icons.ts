import { AddIcon as Add } from '@sanity/icons/Add'
import { BasketIcon as Basket } from '@sanity/icons/Basket'
import { CheckmarkCircleIcon as CheckmarkCircle } from '@sanity/icons/CheckmarkCircle'
import { CloseIcon as Close } from '@sanity/icons/Close'
import { CogIcon as Cog } from '@sanity/icons/Cog'
import { DocumentIcon as Document } from '@sanity/icons/Document'
import { EditIcon as Edit } from '@sanity/icons/Edit'
import { EllipsisHorizontalIcon as EllipsisHorizontal } from '@sanity/icons/EllipsisHorizontal'
import { EnvelopeIcon as Envelope } from '@sanity/icons/Envelope'
import { ErrorOutlineIcon as ErrorOutline } from '@sanity/icons/ErrorOutline'
import { FilterIcon as Filter } from '@sanity/icons/Filter'
import { HomeIcon as Home } from '@sanity/icons/Home'
import { LaunchIcon as Launch } from '@sanity/icons/Launch'
import { OlistIcon as Olist } from '@sanity/icons/Olist'
import { PackageIcon as Package } from '@sanity/icons/Package'
import { SchemaIcon as Schema } from '@sanity/icons/Schema'
import { SearchIcon as Search } from '@sanity/icons/Search'
import { SparkleIcon as Sparkle } from '@sanity/icons/Sparkle'
import { SparklesIcon as Sparkles } from '@sanity/icons/Sparkles'
import { SyncIcon as Sync } from '@sanity/icons/Sync'
import { TrashIcon as Trash } from '@sanity/icons/Trash'
import { TrolleyIcon as Trolley } from '@sanity/icons/Trolley'
import { UserIcon as User } from '@sanity/icons/User'
import { WarningOutlineIcon as WarningOutline } from '@sanity/icons/WarningOutline'
import { WrenchIcon as Wrench } from '@sanity/icons/Wrench'
import { ComponentType } from 'react'
import {
  PiArrowSquareIn,
  PiArrowSquareOut,
  PiArrowUDownLeft,
  PiArticle,
  PiBarcode,
  PiBoat,
  PiCalculator,
  PiCheck,
  PiCircle,
  PiClock,
  PiCube,
  PiDownloadSimple,
  PiFolder,
  PiImage,
  PiImages,
  PiLink,
  PiNote,
  PiPackage,
  PiQuestion,
  PiRocketLaunch,
  PiSlidersHorizontal,
  PiSquaresFour,
  PiStack,
  PiStar,
  PiTag,
  PiTruck,
  PiWarning,
  PiWarningCircle,
  PiWine,
  PiYoutubeLogo,
} from 'react-icons/pi'

import { TbTruckReturn } from 'react-icons/tb'

import { ProductKind } from '../types'

export const AddIcon = Add
export const CouponIcon = PiTag
export const ArrowUDownLeftIcon = PiArrowUDownLeft
export const ArticleIcon = PiArticle
export const BundleItemIcon = Package
export const CarouselIcon = PiImages
export const CategoryListIcon = PiSquaresFour
export const CategoryIcon = Schema
export const CheckIcon = PiCheck
export const CircleIcon = PiCircle
export const ClockIcon = PiClock
export const CloseIcon = Close
export const ConfirmIcon = CheckmarkCircle
export const CustomerIcon = User
export const DeployIcon = PiRocketLaunch
export const EditIcon = Edit
export const EllipsisHorizontalIcon = EllipsisHorizontal
export const NotificationIcon = Envelope
export const ErrorOutlineIcon = ErrorOutline
export const ExternalLinkIcon = PiArrowSquareOut
export const FilterIcon = Filter
export const FulfillmentIcon = Package
export const HeroIcon = PiStar
export const ImageIcon = PiImage
export const InternalLinkIcon = PiArrowSquareIn
export const LaunchIcon = Launch
export const LinkIcon = PiLink
export const ManufacturerIcon = Wrench
export const MenuIcon = Olist
export const NoteIcon = PiNote
export const OptionGroupIcon = Sparkles
export const OptionIcon = Sparkle
export const OrderIcon = Trolley
export const OrderItemIcon = Package
export const OrderStatusHistoryIcon = Package
export const OrderTotalsIcon = PiCalculator
export const PackageIcon = PiPackage
export const PageIcon = Document
export const ProductVariantListIcon = PiSquaresFour
export const ProductListIcon = PiSlidersHorizontal
export const ProductIcon = PiCube
export const ProductKindBundleIcon = PiStack
export const ProductKindDigitalIcon = PiDownloadSimple
export const ProductKindPhysicalIcon = PiPackage
export const ProductKindWineIcon = PiWine
export const ProductVariantIcon = PiSlidersHorizontal
export const QuestionIcon = PiQuestion
export const SearchIcon = Search
export const SendMailIcon = Envelope
export const SettingsIcon = Cog
export const ShippingRateIcon = PiBoat
export const ShopIcon = Basket
export const SubmenuIcon = PiFolder
export const SyncIcon = Sync
export const TaxRuleIcon = PiPackage
export const TrashIcon = Trash
export const TruckIcon = PiTruck
export const OrderWithdrawalIcon = TbTruckReturn
export const UserIcon = User
export const VatBreakdownIcon = PiCalculator
export const VoucherIcon = PiBarcode
export const WarningCircleIcon = PiWarningCircle
export const WarningIcon = PiWarning
export const WarningOutlineIcon = WarningOutline
export const WebsiteIcon = Home
export const WineIcon = PiWine
export const YoutubeLogoIcon = PiYoutubeLogo

export const productKindIcons: Record<ProductKind, ComponentType> = {
  bundle: ProductKindBundleIcon,
  digital: ProductKindDigitalIcon,
  physical: ProductKindPhysicalIcon,
  wine: ProductKindWineIcon,
}

export const linkIcons = {
  internal: InternalLinkIcon,
  external: ExternalLinkIcon,
  submenu: SubmenuIcon,
}
