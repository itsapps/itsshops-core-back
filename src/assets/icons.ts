import {
  AddIcon as Add,
  BasketIcon as Basket,
  CloseIcon as Close,
  CogIcon as Cog,
  DocumentIcon as Document,
  EditIcon as Edit,
  EllipsisHorizontalIcon as EllipsisHorizontal,
  ErrorOutlineIcon as ErrorOutline,
  HomeIcon as Home,
  LaunchIcon as Launch,
  OlistIcon as Olist,
  PackageIcon as Package,
  SchemaIcon as Schema,
  SearchIcon as Search,
  SparkleIcon as Sparkle,
  SparklesIcon as Sparkles,
  SyncIcon as Sync,
  TrashIcon as Trash,
  TrolleyIcon as Trolley,
  UserIcon as User,
  WarningOutlineIcon as WarningOutline,
  WrenchIcon as Wrench,
} from '@sanity/icons'
import { ComponentType } from 'react'
import {
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
  PiImage,
  PiImages,
  PiLink,
  PiNote,
  PiPackage,
  PiQuestion,
  PiRocketLaunch,
  PiSlidersHorizontal,
  PiStack,
  PiStar,
  PiTruck,
  PiWarning,
  PiWarningCircle,
  PiWine,
  PiYoutubeLogo,
} from 'react-icons/pi'

import { ProductKind } from '../types'

export const AddIcon = Add
export const ArrowUDownLeftIcon = PiArrowUDownLeft
export const ArticleIcon = PiArticle
export const BundleItemIcon = Package
export const CarouselIcon = PiImages
export const CategoryIcon = Schema
export const CheckIcon = PiCheck
export const CircleIcon = PiCircle
export const ClockIcon = PiClock
export const CloseIcon = Close
export const CustomerIcon = User
export const DeployIcon = PiRocketLaunch
export const EditIcon = Edit
export const EllipsisHorizontalIcon = EllipsisHorizontal
export const ErrorOutlineIcon = ErrorOutline
export const FulfillmentIcon = Package
export const HeroIcon = PiStar
export const ImageIcon = PiImage
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
export const ProductIcon = PiCube
export const ProductKindBundleIcon = PiStack
export const ProductKindDigitalIcon = PiDownloadSimple
export const ProductKindPhysicalIcon = PiPackage
export const ProductKindWineIcon = PiWine
export const ProductVariantIcon = PiSlidersHorizontal
export const QuestionIcon = PiQuestion
export const SearchIcon = Search
export const SettingsIcon = Cog
export const ShippingRateIcon = PiBoat
export const ShopIcon = Basket
export const SyncIcon = Sync
export const TaxRuleIcon = PiPackage
export const TrashIcon = Trash
export const TruckIcon = PiTruck
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
